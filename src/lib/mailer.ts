import { getSetting } from "@/lib/settings";

// Envoi d'e-mails via Microsoft 365 (Office 365) avec Microsoft Graph.
// Authentification « client credentials » (application Entra ID / Azure AD)
// avec la permission applicative Mail.Send. Les mails partent de l'adresse
// du cabinet (contact@trevys.fr) sans mot de passe SMTP.

export function mailerConfigured(): boolean {
  // L'adresse d'envoi a une valeur par défaut (senderAddress) : seuls le
  // tenant, le client et le secret sont indispensables.
  return (
    !!getSetting("msTenantId") &&
    !!getSetting("msClientId") &&
    !!getSetting("msClientSecret")
  );
}

export function senderAddress(): string {
  return getSetting("msSender") || "contact@trevys.fr";
}

let cachedToken: { value: string; exp: number } | null = null;

export async function getGraphToken(): Promise<string> {
  return getToken();
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.value;

  const tenant = getSetting("msTenantId");
  const clientId = getSetting("msClientId");
  const clientSecret = getSetting("msClientSecret");
  if (!tenant || !clientId || !clientSecret) {
    throw new Error("Microsoft 365 non configuré (tenant / client / secret manquants).");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Échec de l'authentification Microsoft 365 (${res.status}). ${txt.slice(0, 300)}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export type MailAttachment = {
  name: string;
  contentType: string;
  contentBase64: string; // contenu encodé en base64
};

export type MailInput = {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: MailAttachment[];
  // true (défaut) : destinataires en Cci (campagnes de masse — ils ne se
  // voient pas). false : destinataire nominal en « À » (e-mails
  // transactionnels : refus, invitation, confirmation — meilleur rendu et
  // meilleure délivrabilité).
  bcc?: boolean;
  // Version texte brut de l'e-mail (jointe à la version HTML) et lien de
  // désinscription en un clic : deux signaux attendus par les filtres
  // anti-spam pour un envoi de type newsletter. Quand l'un des deux est
  // fourni, le message est transmis à Microsoft au format MIME (voir
  // sendMime) — seul moyen d'ajouter ces éléments via Graph.
  text?: string;
  listUnsubscribeUrl?: string;
};

// --- Envoi au format MIME ---------------------------------------------------
const b64Lines = (s: string) => (Buffer.from(s, "utf8").toString("base64").match(/.{1,76}/g) ?? []).join("\r\n");

// Objet encodé (RFC 2047) : découpé en mots courts pour rester sous la
// longueur de ligne autorisée, sans couper un caractère accentué en deux.
function encodeSubject(subject: string): string {
  if (/^[\x20-\x7e]*$/.test(subject)) return subject;
  const words: string[] = [];
  let chunk = "";
  for (const ch of subject) {
    if (Buffer.byteLength(chunk + ch, "utf8") > 42) { words.push(chunk); chunk = ""; }
    chunk += ch;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${Buffer.from(w, "utf8").toString("base64")}?=`).join("\r\n ");
}

export function buildMime(sender: string, input: MailInput): string {
  const { to, subject, html, replyTo, text, listUnsubscribeUrl } = input;
  const boundary = `=_trevys_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const headers = [
    `From: <${sender}>`,
    `To: ${to.map((a) => `<${a}>`).join(", ")}`,
    `Subject: ${encodeSubject(subject)}`,
    ...(replyTo ? [`Reply-To: <${replyTo}>`] : []),
    "MIME-Version: 1.0",
    ...(listUnsubscribeUrl
      ? [
          `List-Unsubscribe: <${listUnsubscribeUrl}>,\r\n <mailto:${sender}?subject=unsubscribe>`,
          "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
        ]
      : []),
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const part = (type: string, content: string) =>
    `--${boundary}\r\nContent-Type: ${type}; charset="UTF-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64Lines(content)}\r\n`;
  return (
    headers.join("\r\n") + "\r\n\r\n" +
    (text ? part("text/plain", text) : "") +
    part("text/html", html) +
    `--${boundary}--\r\n`
  );
}

async function sendMime(token: string, sender: string, input: MailInput): Promise<void> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
      body: Buffer.from(buildMime(sender, input), "utf8").toString("base64"),
    },
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Envoi MIME refusé (${res.status}). ${txt.slice(0, 200)}`);
  }
}

// Envoie un e-mail via Graph depuis l'adresse du cabinet.
// Les destinataires sont mis en Cci (bcc) pour un envoi de masse discret.
export async function sendMail(input: MailInput): Promise<void> {
  const { to, subject, html, replyTo, attachments, bcc = true } = input;
  const token = await getToken();
  const sender = senderAddress();

  // Newsletter nominative (version texte et/ou désinscription en un clic) :
  // format MIME. En cas de refus par Microsoft, on retombe sur l'envoi
  // classique ci-dessous — une campagne ne doit jamais échouer pour cela.
  if (!bcc && !attachments?.length && (input.text || input.listUnsubscribeUrl)) {
    try {
      await sendMime(token, sender, input);
      return;
    } catch (e) {
      console.error("[mailer] MIME indisponible, envoi classique :", (e as Error).message);
    }
  }

  const recipients = to.map((address) => ({ emailAddress: { address } }));
  const message: Record<string, unknown> = bcc
    ? {
        subject,
        body: { contentType: "HTML", content: html },
        // Masse : cabinet en « À », destinataires en Cci.
        toRecipients: [{ emailAddress: { address: sender } }],
        bccRecipients: recipients,
      }
    : {
        subject,
        body: { contentType: "HTML", content: html },
        // Transactionnel : le destinataire est le vrai « À ».
        toRecipients: recipients,
      };
  if (replyTo) message.replyTo = [{ emailAddress: { address: replyTo } }];
  if (attachments?.length) {
    message.attachments = attachments.map((a) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: a.name,
      contentType: a.contentType,
      contentBytes: a.contentBase64,
    }));
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message, saveToSentItems: true }),
    },
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Échec de l'envoi Microsoft 365 (${res.status}). ${txt.slice(0, 300)}`);
  }
}

// Envoi d'une campagne à une liste, par lots (Graph limite le nombre de
// destinataires par message). Renvoie le nombre d'e-mails traités.
export async function sendCampaign(
  recipients: string[],
  subject: string,
  html: string,
  replyTo?: string,
  batchSize = 400,
): Promise<number> {
  let sent = 0;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await sendMail({ to: batch, subject, html, replyTo });
    sent += batch.length;
  }
  return sent;
}

// Envoi personnalisé : un e-mail par destinataire, avec un HTML propre à
// chacun (lien de désinscription individuel). Les erreurs isolées ne stoppent
// pas la campagne. Renvoie le nombre d'envois réussis.
export async function sendPersonalized(
  recipients: string[],
  subject: string,
  htmlFor: (email: string) => string,
  replyTo?: string,
  // Newsletters : version texte et lien de désinscription propres à chacun.
  extras?: { textFor?: (email: string) => string; unsubscribeFor?: (email: string) => string },
): Promise<number> {
  // Anti-spam : cadence maîtrisée, transparente pour l'utilisateur —
  // un petit délai entre chaque e-mail, et une vraie pause tous les 50
  // (les fournisseurs pénalisent les rafales, pas le volume).
  const BATCH = 50;
  const GAP_MS = 400; // entre deux e-mails
  const PAUSE_MS = 25_000; // entre deux paquets de 50
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let sent = 0;
  for (let i = 0; i < recipients.length; i++) {
    const email = recipients[i];
    try {
      // Le destinataire est le vrai « À » du message. (Avant, il était en
      // copie cachée d'un e-mail adressé au cabinet : un signal typique de
      // courrier indésirable pour les filtres.)
      await sendMail({
        to: [email], subject, html: htmlFor(email), replyTo, bcc: false,
        text: extras?.textFor?.(email),
        listUnsubscribeUrl: extras?.unsubscribeFor?.(email),
      });
      sent += 1;
    } catch (e) {
      console.error(`[mailer] échec pour ${email}:`, (e as Error).message);
    }
    if (i < recipients.length - 1) {
      await wait((i + 1) % BATCH === 0 ? PAUSE_MS : GAP_MS);
    }
  }
  return sent;
}
