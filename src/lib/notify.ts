import { getSetting } from "@/lib/settings";

// Notifications sortantes du cabinet (Telegram pour l'instant).
// Configuration via variables d'environnement, sur l'instance :
//   TELEGRAM_BOT_TOKEN  — jeton du bot (via @BotFather)
//   TELEGRAM_CHAT_ID    — identifiant de la conversation/canal destinataire

export function telegramConfigured(): boolean {
  return !!(getSetting("telegramBotToken") && getSetting("telegramChatId"));
}

// Envoie un message Telegram. Ne lève jamais : renvoie true/false.
export async function sendTelegram(text: string): Promise<boolean> {
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
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[notify] échec Telegram:", e);
    return false;
  }
}
