import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { addThread } from "@/lib/whatsapp-inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vérification du webhook par Meta lors de sa configuration (challenge).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = getSetting("whatsappVerifyToken");
  if (mode === "subscribe" && expected && token === expected) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
}

type WaWebhook = {
  entry?: {
    changes?: {
      value?: {
        messages?: { from?: string; text?: { body?: string }; type?: string }[];
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
  }[];
};

// Message entrant d'un client sur WhatsApp Business : on prépare un brouillon
// de réponse (Alfred) et on prévient John sur Telegram — rien n'est envoyé
// au client avant qu'il ne dise « go ».
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WaWebhook;
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    const text = msg?.text?.body?.trim();
    const from = msg?.from;
    if (msg && text && from) {
      const fromName = value?.contacts?.[0]?.profile?.name;
      // Traitement en arrière-plan : accusé de réception immédiat, Meta
      // relivre sinon le même message.
      (async () => {
        try {
          const { draftWhatsAppReply } = await import("@/lib/comms-agent");
          const draft = await draftWhatsAppReply(text, fromName);
          const thread = addThread({ fromPhone: from, fromName, clientMessage: text, draftReply: draft });
          const { sendTelegram } = await import("@/lib/notify");
          await sendTelegram(
            `💬 Nouveau message WhatsApp de ${fromName ?? from} :\n« ${text} »\n\n` +
              `Brouillon de réponse proposé :\n${draft}\n\n` +
              `Répondez « go » pour l'envoyer tel quel, ou dites-moi quoi changer. (id ${thread.id})`,
          );
        } catch (e) {
          console.error("[whatsapp-webhook] traitement:", e);
        }
      })();
    }
  } catch (e) {
    console.error("[whatsapp-webhook] erreur:", e);
  }
  // Toujours 200 : sinon Meta relivre le même message en boucle.
  return NextResponse.json({ ok: true });
}
