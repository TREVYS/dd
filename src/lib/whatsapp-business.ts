import { getSetting } from "@/lib/settings";

// Envoi de messages via l'API WhatsApp Business (Meta Cloud API). Nécessite
// une app Meta avec le produit WhatsApp, un numéro de téléphone professionnel
// enregistré auprès de Meta (distinct de l'app WhatsApp personnelle), et un
// jeton d'accès permanent — à configurer dans Réglages.

export function whatsappBusinessConfigured(): boolean {
  return !!getSetting("whatsappToken") && !!getSetting("whatsappPhoneId");
}

export async function sendWhatsAppMessage(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const token = getSetting("whatsappToken");
  const phoneId = getSetting("whatsappPhoneId");
  if (!token || !phoneId) return { ok: false, error: "WhatsApp Business non configuré (Réglages)." };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { ok: false, error: `Échec de l'envoi WhatsApp (${res.status}). ${txt.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
