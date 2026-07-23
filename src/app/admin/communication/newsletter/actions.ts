"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { markAllRead, listSubscribers } from "@/lib/newsletter";
import {
  addCampaign,
  getCampaign,
  updateCampaign,
  removeCampaign,
  markdownToEmailHtml,
  wrapEmail,
} from "@/lib/newsletter-campaigns";
import { sendCampaign, mailerConfigured, senderAddress } from "@/lib/mailer";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function markNewsletterReadAction() {
  await guard();
  markAllRead();
  revalidatePath("/admin/communication/newsletter");
}

export async function createCampaignAction(formData: FormData) {
  await guard();
  const c = addCampaign(
    (formData.get("subject") as string) || "",
    (formData.get("body") as string) || "",
  );
  revalidatePath("/admin/communication/newsletter");
  redirect(`/admin/communication/newsletter/${c.id}`);
}

export async function saveCampaignAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  if (!id) return;
  updateCampaign(id, {
    subject: (formData.get("subject") as string) || "Sans objet",
    body: (formData.get("body") as string) || "",
  });
  revalidatePath(`/admin/communication/newsletter/${id}`);
  redirect(`/admin/communication/newsletter/${id}?saved=1`);
}

export async function deleteCampaignAction(formData: FormData) {
  await guard();
  removeCampaign(formData.get("id") as string);
  revalidatePath("/admin/communication/newsletter");
  redirect("/admin/communication/newsletter");
}

// Envoi de test à une seule adresse (par défaut, l'expéditeur du cabinet).
export async function sendTestAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  const c = getCampaign(id);
  if (!c) return;
  const to = ((formData.get("testEmail") as string) || senderAddress()).trim();

  if (!mailerConfigured()) {
    redirect(`/admin/communication/newsletter/${id}?error=notconfig`);
  }
  try {
    await sendCampaign([to], `[Test] ${c.subject}`, wrapEmail(markdownToEmailHtml(c.body)));
  } catch {
    redirect(`/admin/communication/newsletter/${id}?error=send`);
  }
  redirect(`/admin/communication/newsletter/${id}?tested=1`);
}

// Envoi de la campagne à tous les inscrits.
export async function sendCampaignAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  const c = getCampaign(id);
  if (!c) return;

  if (!mailerConfigured()) {
    redirect(`/admin/communication/newsletter/${id}?error=notconfig`);
  }

  const recipients = listSubscribers().map((s) => s.email);
  if (recipients.length === 0) {
    redirect(`/admin/communication/newsletter/${id}?error=empty`);
  }

  let count = 0;
  try {
    count = await sendCampaign(recipients, c.subject, wrapEmail(markdownToEmailHtml(c.body)));
  } catch {
    redirect(`/admin/communication/newsletter/${id}?error=send`);
  }
  updateCampaign(id, { status: "envoye", sentAt: new Date().toISOString(), sentCount: count });
  revalidatePath("/admin/communication/newsletter");
  redirect(`/admin/communication/newsletter/${id}?sent=${count}`);
}
