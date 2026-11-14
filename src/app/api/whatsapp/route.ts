import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import crypto from "node:crypto";
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
// Garde-fou de consommation : ce point d'entrée est public (Meta doit pouvoir
// l'appeler) et chaque message déclenche une rédaction par l'IA. Au-delà de
// ce plafond horaire, les messages sont toujours transmis à John, mais avec
// une réponse type — sans appel à l'IA.
const MAX_AI_DRAFTS_PER_HOUR = 20;
const MAX_TEXT_LENGTH = 2000;
let draftTimes: number[] = [];
function aiBudgetAvailable(): boolean {
  const now = Date.now();
  draftTimes = draftTimes.filter((t) => now - t < 3_600_000);
  if (draftTimes.length >= MAX_AI_DRAFTS_PER_HOUR) return false;
  draftTimes.push(now);
  return true;
}

// Signature de Meta (en-tête X-Hub-Signature-256) : prouve que le message
// vient bien de WhatsApp et non d'un inconnu qui appellerait cette adresse.
function signatureValid(raw: string, header: string | null, secret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const got = header.slice(7);
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    // WhatsApp non configuré : rien n'est traité.
    if (!getSetting("whatsappToken")) return NextResponse.json({ ok: true });
    const raw = await req.text();
    if (raw.length > 200_000) return NextResponse.json({ ok: true });
    const appSecret = getSetting("whatsappAppSecret");
    if (appSecret && !signatureValid(raw, req.headers.get("x-hub-signature-256"), appSecret)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 403 });
    }
    const body = JSON.parse(raw) as WaWebhook;
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    const text = msg?.text?.body?.trim().slice(0, MAX_TEXT_LENGTH);
    const from = msg?.from;
    if (msg && text && from) {
      const fromName = value?.contacts?.[0]?.profile?.name;
      // Traitement en arrière-plan : accusé de réception immédiat, Meta
      // relivre sinon le même message.
      (async () => {
        try {
          const { draftWhatsAppReply } = await import("@/lib/comms-agent");
          const draft = aiBudgetAvailable()
            ? await draftWhatsAppReply(text, fromName)
            : `Bonjour${fromName ? ` ${fromName}` : ""}, merci pour votre message — nous revenons vers vous rapidement.`;
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
