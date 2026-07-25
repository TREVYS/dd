import { markApplicationRefused, markApplicationInvited, type JobApplication } from "@/lib/jobs";
import { mailerConfigured, sendMail } from "@/lib/mailer";
import { getSetting } from "@/lib/settings";

// Actions candidat partagées (cockpit + Alfred) : refus courtois et invitation
// à l'entretien. Les e-mails partent via Microsoft 365.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const WRAP = (inner: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7;color:#2a241c;max-width:560px;">${inner}</div>`;

// Refus : rédigé par Alfred si sa clé API est là, sinon modèle standard.
export async function sendRejectionForApp(app: JobApplication): Promise<{ ok: boolean; detail: string }> {
  if (app.refusedAt) return { ok: false, detail: "Refus déjà envoyé." };
  if (!mailerConfigured()) return { ok: false, detail: "Microsoft 365 non configuré (Réglages)." };

  const firstName = app.name.trim().split(/\s+/)[0] || app.name;
  let drafted: string | null = null;
  try {
    const { draftRejectionEmail } = await import("@/lib/comms-agent");
    drafted = await draftRejectionEmail({
      name: app.name,
      jobTitle: app.jobTitle,
      message: app.message,
      experience: app.experience,
      skills: app.skills,
    });
  } catch { /* repli standard */ }

  const html = drafted
    ? WRAP(drafted.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join(""))
    : WRAP(
        `<p>Bonjour ${esc(firstName)},</p>` +
        `<p>Merci sincèrement pour votre candidature au poste de <b>${esc(app.jobTitle)}</b> et pour l'intérêt que vous portez à Trevys.</p>` +
        `<p>Après une étude attentive de votre profil, nous ne donnerons pas suite à votre candidature pour ce poste. Cette décision ne remet pas en cause la qualité de votre parcours : elle tient à l'adéquation avec les besoins spécifiques de la mission.</p>` +
        `<p>Nous conservons votre candidature et n'hésiterons pas à revenir vers vous si une opportunité correspondant davantage à votre profil s'ouvrait. Nous vous souhaitons une pleine réussite dans vos recherches.</p>` +
        `<p>Bien cordialement,<br><b>L'équipe Trevys</b><br>Expertise comptable &amp; conseil — Paris 16e</p>`,
      );

  try {
    await sendMail({ to: [app.email], subject: `Votre candidature — ${app.jobTitle} — Trevys`, html });
    markApplicationRefused(app.id);
    return { ok: true, detail: `Refus envoyé à ${app.name} (${app.email}).` };
  } catch (e) {
    return { ok: false, detail: `Échec d'envoi : ${(e as Error).message.slice(0, 120)}` };
  }
}

// Invitation à la 2e étape : l'entretien (avec le lien Calendly s'il est réglé).
export async function sendInterviewInviteForApp(app: JobApplication): Promise<{ ok: boolean; detail: string }> {
  if (app.invitedAt) return { ok: false, detail: "Invitation déjà envoyée." };
  if (!mailerConfigured()) return { ok: false, detail: "Microsoft 365 non configuré (Réglages)." };

  const firstName = app.name.trim().split(/\s+/)[0] || app.name;
  const calendly = getSetting("calendlyUrl");

  const html = WRAP(
    `<p>Bonjour ${esc(firstName)},</p>` +
    `<p>Bonne nouvelle : votre candidature au poste de <b>${esc(app.jobTitle)}</b> a retenu toute notre attention, et nous serions ravis d'échanger avec vous lors d'un <b>entretien</b>.</p>` +
    (calendly
      ? `<p>Pour choisir le créneau qui vous convient le mieux, réservez directement dans notre agenda :</p>` +
        `<p><a href="${esc(calendly)}" style="display:inline-block;background-color:#E26A0F;color:#ffffff;font-weight:bold;text-decoration:none;padding:12px 26px;border-radius:100px;">Choisir mon créneau d'entretien</a></p>`
      : `<p>Répondez simplement à cet e-mail avec vos disponibilités des prochains jours, et nous organiserons l'entretien (en visio ou à notre cabinet, Paris 16e).</p>`) +
    `<p>Au plaisir de faire votre connaissance,<br><b>L'équipe Trevys</b><br>Expertise comptable &amp; conseil — Paris 16e</p>`,
  );

  try {
    await sendMail({
      to: [app.email],
      subject: `Votre candidature — ${app.jobTitle} : passons à l'entretien !`,
      html,
      replyTo: getSetting("recruitEmail") || undefined,
    });
    markApplicationInvited(app.id);
    return { ok: true, detail: `Invitation à l'entretien envoyée à ${app.name} (${app.email}).` };
  } catch (e) {
    return { ok: false, detail: `Échec d'envoi : ${(e as Error).message.slice(0, 120)}` };
  }
}
