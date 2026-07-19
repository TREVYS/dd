"use server";

import { z } from "zod";

export type NewsletterState = { ok: boolean; message: string };

const schema = z.object({ email: z.string().email().max(160) });

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot
  if ((formData.get("company") as string)?.trim()) {
    return { ok: true, message: "Merci pour votre inscription !" };
  }

  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: "Adresse e-mail invalide." };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.info("[newsletter] inscription (Brevo non configuré):", parsed.data.email);
    return { ok: true, message: "Merci ! Votre inscription a bien été prise en compte." };
  }

  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email: parsed.data.email,
        updateEnabled: true,
        ...(listId ? { listIds: [listId] } : {}),
      }),
    });

    // 201 créé, 204 mis à jour ; 400 "already associated" = déjà inscrit.
    if (res.ok) {
      return { ok: true, message: "Merci ! Votre inscription est confirmée." };
    }
    const data = (await res.json().catch(() => ({}))) as { code?: string };
    if (data.code === "duplicate_parameter") {
      return { ok: true, message: "Vous êtes déjà inscrit — merci !" };
    }
    return { ok: false, message: "Inscription impossible pour le moment. Réessayez." };
  } catch (e) {
    console.error("[newsletter] échec Brevo:", e);
    return { ok: false, message: "Inscription impossible pour le moment. Réessayez." };
  }
}
