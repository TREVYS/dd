import fs from "node:fs";
import path from "node:path";
import { getSetting } from "@/lib/settings";
import { getGraphToken, mailerConfigured } from "@/lib/mailer";

// Résumé automatique de la boîte contact@trevys.fr, envoyé chaque matin sur
// Telegram. Lecture SEULE (permission Microsoft Graph Mail.Read, à ajouter
// sur l'application Azure AD existante — Alfred ne répond ni ne supprime
// jamais rien dans la boîte).
const STATE_FILE = path.join(process.cwd(), "data", "mail-digest.json");

const MAILBOX = "contact@trevys.fr";

export type MailItem = {
  subject: string;
  from: string;
  receivedAt: string;
  preview: string;
  isRead: boolean;
};

function parisToday(): string {
  return new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}

// true si la permission Mail.Read n'a pas encore été accordée (ou boîte
// absente) : on le distingue d'une vraie panne réseau pour un message clair.
export async function fetchRecentInbox(sinceISO: string): Promise<MailItem[] | { error: string }> {
  if (!mailerConfigured()) return { error: "Microsoft 365 non configuré (Réglages)." };
  try {
    const token = await getGraphToken();
    const filter = encodeURIComponent(`receivedDateTime ge ${sinceISO}`);
    const select = "subject,from,receivedDateTime,bodyPreview,isRead";
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAILBOX)}/mailFolders/inbox/messages` +
        `?$filter=${filter}&$orderby=receivedDateTime desc&$top=25&$select=${select}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status === 403) {
      return { error: "Permission Mail.Read manquante sur l'application Microsoft 365 (voir Réglages → Azure AD)." };
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { error: `Erreur Microsoft Graph (${res.status}). ${txt.slice(0, 200)}` };
    }
    const data = (await res.json()) as {
      value?: { subject?: string; from?: { emailAddress?: { name?: string; address?: string } }; receivedDateTime?: string; bodyPreview?: string; isRead?: boolean }[];
    };
    return (data.value ?? []).map((m) => ({
      subject: m.subject || "(sans objet)",
      from: m.from?.emailAddress?.name || m.from?.emailAddress?.address || "expéditeur inconnu",
      receivedAt: m.receivedDateTime ?? "",
      preview: (m.bodyPreview ?? "").replace(/\s+/g, " ").trim().slice(0, 200),
      isRead: !!m.isRead,
    }));
  } catch (e) {
    return { error: (e as Error).message };
  }
}

function fallbackDigest(items: MailItem[]): string {
  const unread = items.filter((m) => !m.isRead).length;
  if (items.length === 0) return "Aucun nouveau message depuis hier.";
  return `${items.length} message(s) reçu(s) dont ${unread} non lu(s). Le plus récent : « ${items[0].subject} » de ${items[0].from}.`;
}

async function alfredMailSummary(items: MailItem[]): Promise<string> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey || items.length === 0) return fallbackDigest(items);
  try {
    const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
    const client = new AnthropicSDK({ apiKey });
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system:
        "Tu es Alfred, assistant de John (fondateur du cabinet Trevys). Tu résumes les e-mails reçus sur contact@trevys.fr pour son brief du matin. " +
        "3 à 6 lignes maximum, en français direct : regroupe par sujet/expéditeur si pertinent, signale clairement ce qui semble nécessiter une réponse rapide (prospect, client, urgence), " +
        "ignore ce qui est clairement du spam/newsletter. Pas de liste à puces si moins de 3 messages — une ou deux phrases suffisent alors.",
      messages: [
        {
          role: "user",
          content: items
            .map((m, i) => `${i + 1}. De ${m.from} — « ${m.subject} »${m.isRead ? "" : " [non lu]"}\n${m.preview}`)
            .join("\n\n"),
        },
      ],
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim();
    return text || fallbackDigest(items);
  } catch {
    return fallbackDigest(items);
  }
}

// Envoi au plus une fois par jour (calendrier Paris), au premier passage du
// battement de cœur après minuit — complémentaire des routines et du
// rapport d'audience hebdomadaire.
export async function maybeSendDailyMailDigest(): Promise<void> {
  const today = parisToday();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const st = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as { lastSentDay?: string };
      if (st.lastSentDay === today) return;
    }
  } catch { /* état illisible : on tente l'envoi */ }

  const { telegramConfigured, sendTelegram } = await import("@/lib/notify");
  if (!telegramConfigured() || !mailerConfigured()) return;

  // Réservation avant l'appel réseau : jamais deux envois le même jour.
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastSentDay: today }), "utf8");
  } catch { /* sans persistance, tant pis : l'envoi reste utile */ }

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const result = await fetchRecentInbox(since);
  if ("error" in result) {
    // Une seule alerte au total (pas un rappel quotidien tant que la
    // permission Mail.Read n'est pas accordée) : on marque l'avertissement
    // comme déjà envoyé, distinctement du jour d'envoi normal.
    try {
      const st = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : {};
      if (st.warnedPermission) return;
      fs.writeFileSync(STATE_FILE, JSON.stringify({ ...st, warnedPermission: true }), "utf8");
    } catch { /* tant pis, au pire l'alerte se répète */ }
    await sendTelegram(`🎩 Résumé des mails indisponible : ${result.error}`).catch(() => {});
    return;
  }
  if (result.length === 0) return; // rien à raconter, pas de notification inutile

  const summary = await alfredMailSummary(result);
  await sendTelegram(`📬 Votre boîte ${MAILBOX} ce matin\n\n${summary}`).catch(() => {});
}
