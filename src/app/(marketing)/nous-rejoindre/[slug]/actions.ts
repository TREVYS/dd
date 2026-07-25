"use server";

import { z } from "zod";
import { getJob, addApplication } from "@/lib/jobs";

export type ApplyState = { ok: boolean; message: string };

const schema = z.object({
  name: z.string().min(2, "Nom requis").max(120),
  email: z.string().email("E-mail invalide").max(160),
  phone: z.string().max(40).optional().default(""),
  linkedin: z.string().max(240).optional().default(""),
  message: z.string().min(20, "Parlez-nous un peu de vous (20 caractères minimum).").max(6000),
});

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  // Honeypot anti-bot.
  if ((formData.get("website") as string)?.trim()) {
    return { ok: true, message: "Merci — votre candidature a bien été envoyée." };
  }

  const job = getJob((formData.get("jobSlug") as string) || "");
  if (!job) return { ok: false, message: "Offre introuvable." };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const d = parsed.data;

  // 1) Archive (cockpit → Recrutement) + compteur de candidatures.
  addApplication({
    jobId: job.id,
    jobTitle: job.title,
    name: d.name,
    email: d.email,
    phone: d.phone || undefined,
    linkedin: d.linkedin || undefined,
    message: d.message,
  });

  // 2) Alerte Telegram.
  try {
    const { sendTelegram } = await import("@/lib/notify");
    sendTelegram(
      `🧑‍💼 Nouvelle candidature — ${job.title}\n${d.name} — ${d.email}${d.phone ? ` — ${d.phone}` : ""}${d.linkedin ? `\nLinkedIn : ${d.linkedin}` : ""}\n\n${d.message.slice(0, 500)}`,
    ).catch(() => {});
  } catch { /* non bloquant */ }

  // 3) E-mail vers la boîte du cabinet (Microsoft 365).
  try {
    const { mailerConfigured, sendMail, senderAddress } = await import("@/lib/mailer");
    if (mailerConfigured()) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
      await sendMail({
        to: [senderAddress()],
        subject: `Candidature — ${job.title} — ${d.name}`,
        replyTo: d.email,
        html:
          `<div style="font-family:sans-serif;line-height:1.6;color:#222;">` +
          `<h2 style="margin:0 0 12px;">Nouvelle candidature</h2>` +
          `<p><b>Poste :</b> ${esc(job.title)}<br>` +
          `<b>Candidat :</b> ${esc(d.name)}<br>` +
          `<b>E-mail :</b> <a href="mailto:${esc(d.email)}">${esc(d.email)}</a><br>` +
          `<b>Téléphone :</b> ${esc(d.phone || "—")}<br>` +
          `<b>LinkedIn :</b> ${d.linkedin ? `<a href="${esc(d.linkedin)}">${esc(d.linkedin)}</a>` : "—"}</p>` +
          `<div style="background:#faf6f0;border-left:3px solid #F5811F;border-radius:0 8px 8px 0;padding:14px 16px;">${esc(d.message)}</div>` +
          `<p style="color:#999;font-size:12px;margin-top:16px;">Répondez directement à cet e-mail pour écrire au candidat.</p>` +
          `</div>`,
      });
    }
  } catch (e) {
    console.error("[recrutement] échec d'envoi e-mail:", e);
  }

  return {
    ok: true,
    message: "Merci — votre candidature a bien été envoyée. Nous revenons vers vous rapidement.",
  };
}
