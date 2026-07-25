"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addJob, getJob, removeJob, updateJob, markApplicationRead, removeApplication, getApplication, markApplicationRefused, type JobStatus } from "@/lib/jobs";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const PATH = "/admin/recrutement";

function refresh() {
  revalidatePath(PATH);
  revalidatePath("/nous-rejoindre");
}

export async function saveJobAction(formData: FormData) {
  await guard();
  const id = (formData.get("id") as string) || "";
  const data = {
    title: ((formData.get("title") as string) || "Sans titre").trim(),
    category: ((formData.get("category") as string) || "Expertise comptable").trim(),
    contract: ((formData.get("contract") as string) || "CDI").trim(),
    location: ((formData.get("location") as string) || "Paris 16e").trim(),
    summary: ((formData.get("summary") as string) || "").trim(),
    body: (formData.get("body") as string) || "",
    status: (((formData.get("status") as string) || "brouillon") as JobStatus),
  };
  if (id) {
    updateJob(id, data);
  } else {
    addJob(data);
  }
  refresh();
  redirect(`${PATH}?ok=1`);
}

export async function toggleJobAction(formData: FormData) {
  await guard();
  const j = getJob(formData.get("id") as string);
  if (j) updateJob(j.id, { status: j.status === "publie" ? "brouillon" : "publie" });
  refresh();
}

export async function deleteJobAction(formData: FormData) {
  await guard();
  removeJob(formData.get("id") as string);
  refresh();
}

export async function markAppReadAction(formData: FormData) {
  await guard();
  markApplicationRead(formData.get("id") as string);
  revalidatePath(PATH);
}

// Envoie un refus courtois au candidat (e-mail automatique via Microsoft 365)
// et marque la candidature comme refusée.
export async function sendRejectionAction(formData: FormData) {
  await guard();
  const app = getApplication(formData.get("id") as string);
  if (!app || app.refusedAt) return;

  const { mailerConfigured, sendMail } = await import("@/lib/mailer");
  if (!mailerConfigured()) {
    redirect(`${PATH}?refus=notconfig`);
  }

  const firstName = app.name.trim().split(/\s+/)[0] || app.name;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  try {
    await sendMail({
      to: [app.email],
      subject: `Votre candidature — ${app.jobTitle} — Trevys`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7;color:#2a241c;max-width:560px;">` +
        `<p>Bonjour ${esc(firstName)},</p>` +
        `<p>Merci sincèrement pour votre candidature au poste de <b>${esc(app.jobTitle)}</b> et pour l'intérêt que vous portez à Trevys.</p>` +
        `<p>Après une étude attentive de votre profil, nous ne donnerons pas suite à votre candidature pour ce poste. Cette décision ne remet pas en cause la qualité de votre parcours : elle tient à l'adéquation avec les besoins spécifiques de la mission.</p>` +
        `<p>Nous conservons votre candidature et n'hésiterons pas à revenir vers vous si une opportunité correspondant davantage à votre profil s'ouvrait. Nous vous souhaitons une pleine réussite dans vos recherches.</p>` +
        `<p>Bien cordialement,<br><b>L'équipe Trevys</b><br>Expertise comptable &amp; conseil — Paris 16e</p>` +
        `</div>`,
    });
    markApplicationRefused(app.id);
  } catch (e) {
    console.error("[recrutement] échec d'envoi du refus:", e);
    redirect(`${PATH}?refus=err`);
  }
  revalidatePath(PATH);
  redirect(`${PATH}?refus=ok`);
}

export async function deleteAppAction(formData: FormData) {
  await guard();
  removeApplication(formData.get("id") as string);
  revalidatePath(PATH);
}
