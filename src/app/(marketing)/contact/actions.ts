"use server";

import { z } from "zod";

export type ContactState = {
  ok: boolean;
  message: string;
};

const schema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(80),
  lastName: z.string().min(1, "Nom requis").max(80),
  email: z.string().email("E-mail invalide").max(160),
  phone: z.string().max(40).optional().default(""),
  subject: z.string().max(80).optional().default(""),
  message: z.string().min(10, "Message trop court").max(4000),
});

async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Si Turnstile n'est pas configuré, on ne bloque pas (honeypot + timing gèrent le spam de base).
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // 1) Honeypot — un champ invisible que seuls les bots remplissent.
  if ((formData.get("website") as string)?.trim()) {
    return { ok: true, message: "Merci — votre message a bien été transmis." };
  }

  // 2) Timing — soumission trop rapide = robot.
  const t = Number(formData.get("_t") ?? 0);
  if (t && Date.now() - t < 2500) {
    return { ok: false, message: "Merci de réessayer dans un instant." };
  }

  // 3) Anti-bot serveur (Cloudflare Turnstile, si configuré).
  const okTurnstile = await verifyTurnstile(
    (formData.get("cf-turnstile-response") as string) ?? null,
  );
  if (!okTurnstile) {
    return { ok: false, message: "Vérification anti-robot échouée. Réessayez." };
  }

  // 4) Validation des champs.
  const parsed = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // 5) Envoi. Utilise le SMTP configuré (nodemailer) s'il est présent.
  const to = process.env.CONTACT_TO ?? "contact@trevys-advisory.fr";
  try {
    if (process.env.SMTP_HOST) {
      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
      const d = parsed.data;
      await transport.sendMail({
        from: process.env.SMTP_FROM ?? `Site Trevys <${to}>`,
        to,
        replyTo: d.email,
        subject: `Contact site — ${d.subject || "Nouvelle demande"}`,
        text: `De : ${d.firstName} ${d.lastName}\nE-mail : ${d.email}\nTéléphone : ${d.phone}\nSujet : ${d.subject}\n\n${d.message}`,
      });
    } else {
      // Pas de SMTP configuré : on journalise pour ne rien perdre.
      console.info("[contact] message reçu (SMTP non configuré):", parsed.data.email);
    }
  } catch (e) {
    console.error("[contact] échec d'envoi:", e);
    return { ok: false, message: "Envoi impossible pour le moment. Réessayez plus tard." };
  }

  return {
    ok: true,
    message: "Merci — votre message a bien été transmis. Nous vous recontactons rapidement.",
  };
}
