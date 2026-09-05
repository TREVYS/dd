import { getSetting } from "@/lib/settings";

// Notifications sortantes du cabinet (Telegram pour l'instant).
// Configuration via variables d'environnement, sur l'instance :
//   TELEGRAM_BOT_TOKEN  — jeton du bot (via @BotFather)
//   TELEGRAM_CHAT_ID    — identifiant de la conversation/canal destinataire

export function telegramConfigured(): boolean {
  return !!(getSetting("telegramBotToken") && getSetting("telegramChatId"));
}

// Envoie un message Telegram. Ne lève jamais : renvoie true/false.
// plain=true : texte brut (pour les réponses libres d'Alfred, dont le contenu
// pourrait être rejeté par l'interpréteur HTML de Telegram).
// Envoie un document (ex. CV d'un candidat) sur Telegram. Ne lève jamais.
export async function sendTelegramDocument(
  buffer: Buffer,
  filename: string,
  caption?: string,
): Promise<boolean> {
  const token = getSetting("telegramBotToken");
  const chatId = getSetting("telegramChatId");
  if (!token || !chatId) return false;
  try {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    if (caption) fd.append("caption", caption.slice(0, 1000));
    fd.append("document", new Blob([new Uint8Array(buffer)]), filename);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: fd,
    });
    return res.ok;
  } catch (e) {
    console.error("[notify] échec envoi document Telegram:", e);
    return false;
  }
}

// Envoie une photo (fichier local de la médiathèque ou URL publique) avec sa
// légende — utilisé par le relais Instagram manuel. Ne lève jamais.
export async function sendTelegramPhoto(image: string, caption?: string): Promise<boolean> {
  const token = getSetting("telegramBotToken");
  const chatId = getSetting("telegramChatId");
  if (!token || !chatId) return false;
  try {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    if (caption) fd.append("caption", caption.slice(0, 1000));
    if (image.startsWith("/")) {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const full = path.join(process.cwd(), "public", "uploads", path.basename(image));
      if (!fs.existsSync(full)) return false;
      fd.append("photo", new Blob([new Uint8Array(fs.readFileSync(full))]), path.basename(image));
    } else {
      fd.append("photo", image); // URL publique : Telegram la télécharge lui-même
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: fd });
    return res.ok;
  } catch (e) {
    console.error("[notify] échec envoi photo Telegram:", e);
    return false;
  }
}

// Indicateur « en train d'écrire… » (visible ~5 s côté Telegram — à
// rafraîchir pendant un long travail).
export async function sendTelegramTyping(): Promise<void> {
  const token = getSetting("telegramBotToken");
  const chatId = getSetting("telegramChatId");
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
  } catch {
    /* sans gravité */
  }
}

export async function sendTelegram(text: string, opts?: { plain?: boolean }): Promise<boolean> {
  const token = getSetting("telegramBotToken");
  const chatId = getSetting("telegramChatId");
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(opts?.plain ? {} : { parse_mode: "HTML" }),
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok && !opts?.plain) {
      // Repli en texte brut si l'HTML est rejeté.
      return sendTelegram(text, { plain: true });
    }
    return res.ok;
  } catch (e) {
    console.error("[notify] échec Telegram:", e);
    return false;
  }
}
