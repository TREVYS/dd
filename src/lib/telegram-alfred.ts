import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSetting } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

// Alfred sur Telegram : le bot du cabinet devient une conversation avec
// Alfred (mêmes outils que dans le cockpit : articles, posts, newsletters,
// routines…). Sécurité : jeton secret vérifié sur chaque webhook + seuls les
// messages du Chat ID configuré sont traités.

const FILE = path.join(process.cwd(), "data", "telegram-chat.json");
const MAX_TURNS = 16; // mémoire de conversation conservée
const MAX_UPDATES = 60; // dédoublonnage des livraisons Telegram

type Store = {
  turns: { role: "user" | "assistant"; content: string }[];
  updateIds: number[];
};

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return { turns: [], updateIds: [] };
    return { turns: [], updateIds: [], ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return { turns: [], updateIds: [] };
  }
}

function write(store: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

// Jeton secret du webhook, dérivé du jeton du bot : rien de nouveau à stocker.
export function webhookSecret(): string {
  const token = getSetting("telegramBotToken") ?? "";
  const secret = process.env.AUTH_SECRET || "trevys-tg";
  return crypto.createHmac("sha256", secret).update(token).digest("hex").slice(0, 32);
}

export const WEBHOOK_URL = `${SITE_URL}/api/telegram/webhook`;

// Active la conversation : déclare le webhook auprès de Telegram.
export async function enableAlfredOnTelegram(): Promise<{ ok: boolean; detail: string }> {
  const token = getSetting("telegramBotToken");
  if (!token) return { ok: false, detail: "Jeton du bot non configuré." };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        secret_token: webhookSecret(),
        allowed_updates: ["message"],
        drop_pending_updates: true,
      }),
    });
    const data = (await res.json()) as { ok: boolean; description?: string };
    return { ok: data.ok, detail: data.description ?? (data.ok ? "Webhook actif." : "Échec.") };
  } catch (e) {
    return { ok: false, detail: (e as Error).message };
  }
}

export async function disableAlfredOnTelegram(): Promise<boolean> {
  const token = getSetting("telegramBotToken");
  if (!token) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

// État du webhook (pour l'affichage dans les Réglages).
export async function telegramWebhookStatus(): Promise<{ active: boolean; url?: string; lastError?: string }> {
  const token = getSetting("telegramBotToken");
  if (!token) return { active: false };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = (await res.json()) as { ok: boolean; result?: { url?: string; last_error_message?: string } };
    const url = data.result?.url ?? "";
    return { active: url === WEBHOOK_URL, url, lastError: data.result?.last_error_message };
  } catch {
    return { active: false };
  }
}

// Traite un message entrant. Renvoie true si le message a été pris en charge.
export async function handleTelegramMessage(update: {
  update_id?: number;
  message?: { text?: string; chat?: { id?: number | string } };
}): Promise<void> {
  const text = update.message?.text?.trim();
  const chatId = String(update.message?.chat?.id ?? "");
  const updateId = update.update_id;
  if (!text || !chatId) return;

  // Seul le Chat ID configuré (toi) peut parler à Alfred.
  const allowed = getSetting("telegramChatId");
  if (!allowed || chatId !== String(allowed)) return;

  // Dédoublonnage (Telegram relivre en cas de réponse lente).
  const store = read();
  if (typeof updateId === "number") {
    if (store.updateIds.includes(updateId)) return;
    store.updateIds = [...store.updateIds, updateId].slice(-MAX_UPDATES);
    write(store);
  }

  const { sendTelegram } = await import("@/lib/notify");

  if (text === "/start") {
    await sendTelegram(
      "🎩 Alfred à votre service. Dites-moi tout : « rédige un article sur… », « prépare un post LinkedIn… », « une newsletter sur nos derniers articles », « crée une routine hebdo… ». Tout part en brouillon dans le cockpit — vous validez, je m'occupe du reste. (/reset pour repartir de zéro)",
    );
    return;
  }
  if (text === "/reset") {
    write({ ...read(), turns: [] });
    await sendTelegram("🧹 Conversation remise à zéro. Je vous écoute.");
    return;
  }

  // Historique + appel de l'agent (mêmes outils que le cockpit).
  const turns = [...read().turns, { role: "user" as const, content: text }].slice(-MAX_TURNS);
  try {
    const { runCommsAgent } = await import("@/lib/comms-agent");
    const { reply, actions } = await runCommsAgent(turns);
    const suffix = actions.length ? `\n\n✅ ${actions.join("\n✅ ")}` : "";
    const full = (reply + suffix).trim() || "C'est fait.";

    const next = [...turns, { role: "assistant" as const, content: reply }].slice(-MAX_TURNS);
    write({ ...read(), turns: next });

    // Telegram limite un message à 4096 caractères : on découpe.
    for (let i = 0; i < full.length; i += 3900) {
      await sendTelegram(full.slice(i, i + 3900), { plain: true });
    }
  } catch (e) {
    console.error("[telegram-alfred] échec:", e);
    await sendTelegram("⚠️ Je n'ai pas pu traiter ce message (voir la configuration d'Alfred dans les Réglages).");
  }
}
