"use server";

import { z } from "zod";
import { getJob, addApplication, saveCv } from "@/lib/jobs";

const CV_MAX_BYTES = 3 * 1024 * 1024; // 3 Mo (limite des pièces jointes e-mail)
const CV_TYPES = /\.(pdf|doc|docx)$/i;

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

  // Profil structuré (façon LinkedIn).
  const experience = String(formData.get("experience") ?? "").slice(0, 40);
  const education = String(formData.get("education") ?? "").slice(0, 80);
  const skills = formData.getAll("skills").map(String).slice(0, 20);
  const languages = formData.getAll("languages").map(String).slice(0, 10);
  const availability = String(formData.get("availability") ?? "").slice(0, 40);

  // CV obligatoire (PDF ou Word, 3 Mo max).
  const cv = formData.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return { ok: false, message: "Merci de joindre votre CV (PDF ou Word)." };
  }
  if (!CV_TYPES.test(cv.name)) {
    return { ok: false, message: "Format de CV non pris en charge — utilisez un PDF ou un Word (.doc/.docx)." };
  }
  if (cv.size > CV_MAX_BYTES) {
    return { ok: false, message: "CV trop volumineux (3 Mo maximum)." };
  }
  const cvBuffer = Buffer.from(await cv.arrayBuffer());
  let cvName: string | undefined;
  try {
    cvName = saveCv(cvBuffer, cv.name);
  } catch (e) {
    console.error("[recrutement] échec de sauvegarde du CV:", e);
  }

  // 1) Archive (cockpit → Recrutement) + compteur de candidatures.
  addApplication({
    jobId: job.id,
    jobTitle: job.title,
    name: d.name,
    email: d.email,
    phone: d.phone || undefined,
    linkedin: d.linkedin || undefined,
    message: d.message,
    cvName,
    experience: experience || undefined,
    education: education || undefined,
    skills: skills.length ? skills : undefined,
    languages: languages.length ? languages : undefined,
    availability: availability || undefined,
  });

  // 2) Alerte Telegram.
  try {
    const { sendTelegram } = await import("@/lib/notify");
    sendTelegram(
      `🧑‍💼 Nouvelle candidature — ${job.title}\n${d.name} — ${d.email}${d.phone ? ` — ${d.phone}` : ""}\nExp. : ${experience || "—"} · ${education || "—"} · Dispo : ${availability || "—"}\nCompétences : ${skills.join(", ") || "—"}\nLangues : ${languages.join(", ") || "—"}\n\n${d.message.slice(0, 400)}`,
    ).catch(() => {});
  } catch { /* non bloquant */ }

  // 3) Synthèse par e-mail (adresse réglable dans le cockpit), CV en pièce jointe.
  try {
    const { mailerConfigured, sendMail, senderAddress } = await import("@/lib/mailer");
    const { getSetting } = await import("@/lib/settings");
    if (mailerConfigured()) {
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
      const ext = cv.name.match(/\.(pdf|docx?)$/i)?.[1]?.toLowerCase() ?? "pdf";
      const contentType =
        ext === "pdf" ? "application/pdf"
        : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/msword";
      await sendMail({
        to: [getSetting("recruitEmail") || senderAddress()],
        attachments: [{
          name: `CV-${d.name.replace(/[^\w.-]+/g, "-")}.${ext}`,
          contentType,
          contentBase64: cvBuffer.toString("base64"),
        }],
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
          `<p style="background:#f4f0e9;border-radius:8px;padding:10px 14px;">` +
          `<b>Expérience :</b> ${esc(experience || "—")}<br>` +
          `<b>Formation :</b> ${esc(education || "—")}<br>` +
          `<b>Compétences :</b> ${esc(skills.join(", ") || "—")}<br>` +
          `<b>Langues :</b> ${esc(languages.join(", ") || "—")}<br>` +
          `<b>Disponibilité :</b> ${esc(availability || "—")}</p>` +
          `<div style="background:#faf6f0;border-left:3px solid #F5811F;border-radius:0 8px 8px 0;padding:14px 16px;">${esc(d.message)}</div>` +
          `<p style="color:#999;font-size:12px;margin-top:16px;">Répondez directement à cet e-mail pour écrire au candidat.</p>` +
          `</div>`,
      });
    }
  } catch (e) {
    console.error("[recrutement] échec d'envoi e-mail:", e);
  }

  // 4) Confirmation au candidat (accusé de réception).
  try {
    const { mailerConfigured, sendMail } = await import("@/lib/mailer");
    const { getSetting } = await import("@/lib/settings");
    if (mailerConfigured()) {
      const esc2 = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const first = d.name.trim().split(/\s+/)[0] || d.name;
      await sendMail({
        to: [d.email],
        replyTo: getSetting("recruitEmail") || undefined,
        subject: `Candidature bien reçue — ${job.title} — Trevys`,
        html:
          `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7;color:#2a241c;max-width:560px;">` +
          `<p>Bonjour ${esc2(first)},</p>` +
          `<p>Nous confirmons la bonne réception de votre candidature au poste de <b>${esc2(job.title)}</b>. Merci pour l'intérêt que vous portez à Trevys !</p>` +
          `<p>Chaque candidature est lue par un associé : nous revenons vers vous rapidement.</p>` +
          `<p>À très vite,<br><b>L'équipe Trevys</b><br>Expertise comptable &amp; conseil — Paris 16e</p>` +
          `</div>`,
      });
    }
  } catch (e) {
    console.error("[recrutement] échec de la confirmation candidat:", e);
  }

  return {
    ok: true,
    message: "Merci — votre candidature a bien été envoyée. Nous revenons vers vous rapidement.",
  };
}
