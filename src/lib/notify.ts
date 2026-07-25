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
