// Notifications sortantes du cabinet (Telegram pour l'instant).
// Configuration via variables d'environnement, sur l'instance :
//   TELEGRAM_BOT_TOKEN  — jeton du bot (via @BotFather)
//   TELEGRAM_CHAT_ID    — identifiant de la conversation/canal destinataire

export function telegramConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

// Envoie un message Telegram. Ne lève jamais : renvoie true/false.
export async function sendTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
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
