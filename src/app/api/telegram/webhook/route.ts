import { NextResponse } from "next/server";
import { handleTelegramMessage, webhookSecret } from "@/lib/telegram-alfred";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Les réponses d'Alfred peuvent prendre du temps (appels au modèle + outils).
export const maxDuration = 60;

// Webhook Telegram : reçoit les messages envoyés au bot du cabinet et les
// transmet à Alfred. Sécurité : Telegram renvoie le jeton secret déclaré au
// setWebhook dans un en-tête — toute requête sans ce jeton est rejetée.
export async function POST(req: Request) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== webhookSecret()) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const update = await req.json();
    // Accusé de réception IMMÉDIAT : le travail d'Alfred (modèle + outils)
    // peut dépasser la minute, or Telegram relivre le message si le webhook
    // ne répond pas vite — le traitement continue donc en arrière-plan et
    // la réponse part via sendMessage quand elle est prête.
    handleTelegramMessage(update).catch((e) =>
      console.error("[telegram-webhook] traitement en arrière-plan:", e),
    );
  } catch (e) {
    console.error("[telegram-webhook] erreur:", e);
  }
  // Toujours 200 : sinon Telegram relivre le même message en boucle.
  return NextResponse.json({ ok: true });
}
