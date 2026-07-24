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

  const d = parsed.data;

  // 5) Archive d'abord (cockpit → Messages) : aucun message n'est jamais perdu.
  try {
    const { addMessage } = await import("@/lib/contact-messages");
    addMessage({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      subject: d.subject,
      message: d.message,
    });
  } catch (e) {
    console.error("[contact] échec d'archivage:", e);
  }

  // 6) Notification Telegram immédiate (si configurée).
  try {
    const { sendTelegram } = await import("@/lib/notify");
    sendTelegram(
      `📬 Nouveau message via le site\n${d.firstName} ${d.lastName} — ${d.email}${d.phone ? ` — ${d.phone}` : ""}\nSujet : ${d.subject || "—"}\n\n${d.message.slice(0, 500)}`,
    ).catch(() => {});
  } catch { /* non bloquant */ }

  // 7) E-mail vers la boîte du cabinet via Microsoft 365 (Graph).
  try {
    const { mailerConfigured, sendMail, senderAddress } = await import("@/lib/mailer");
    if (mailerConfigured()) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
      await sendMail({
        to: [process.env.CONTACT_TO ?? senderAddress()],
        subject: `Contact site — ${d.subject || "Nouvelle demande"} — ${d.firstName} ${d.lastName}`,
        replyTo: d.email,
        html:
          `<div style="font-family:sans-serif;line-height:1.6;color:#222;">` +
          `<h2 style="margin:0 0 12px;">Nouveau message depuis www.trevys.fr</h2>` +
          `<p><b>De :</b> ${esc(d.firstName)} ${esc(d.lastName)}<br>` +
          `<b>E-mail :</b> <a href="mailto:${esc(d.email)}">${esc(d.email)}</a><br>` +
          `<b>Téléphone :</b> ${esc(d.phone || "—")}<br>` +
          `<b>Sujet :</b> ${esc(d.subject || "—")}</p>` +
          `<div style="background:#faf6f0;border-left:3px solid #F5811F;border-radius:0 8px 8px 0;padding:14px 16px;">${esc(d.message)}</div>` +
          `<p style="color:#999;font-size:12px;margin-top:16px;">Répondez directement à cet e-mail pour écrire au contact.</p>` +
          `</div>`,
      });
    } else {
      console.info("[contact] message archivé (Microsoft 365 non configuré):", d.email);
    }
  } catch (e) {
    // L'e-mail a échoué mais le message est archivé et notifié : on ne bloque
    // pas le visiteur.
    console.error("[contact] échec d'envoi e-mail:", e);
  }

  return {
    ok: true,
    message: "Merci — votre message a bien été transmis. Nous vous recontactons rapidement.",
  };
}
