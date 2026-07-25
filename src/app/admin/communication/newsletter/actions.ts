"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { markAllRead, listSubscribers, removeSubscriber } from "@/lib/newsletter";
import {
  addCampaign,
  getCampaign,
  updateCampaign,
  removeCampaign,
  markdownToEmailHtml,
  wrapEmail,
  unsubscribeUrl,
} from "@/lib/newsletter-campaigns";
import { sendCampaign, sendPersonalized, mailerConfigured, senderAddress } from "@/lib/mailer";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function markNewsletterReadAction() {
  await guard();
  markAllRead();
  revalidatePath("/admin/communication/newsletter");
}

export async function deleteSubscriberAction(formData: FormData) {
  await guard();
  const email = (formData.get("email") as string) || "";
  if (email) removeSubscriber(email);
  revalidatePath("/admin/communication/newsletter");
}

// Compose un mailing à partir d'articles publiés sélectionnés (diffusion).
export async function createArticlesCampaignAction(formData: FormData) {
  await guard();
  const slugs = formData.getAll("slugs").map(String);
  if (slugs.length === 0) {
    redirect("/admin/communication/newsletter?error=noselection");
  }

  const { getPost } = await import("@/lib/blog");
  const { SITE_URL } = await import("@/lib/site");
  const posts = slugs
    .map((s) => getPost(s))
    .filter((p): p is NonNullable<ReturnType<typeof getPost>> => !!p);

  const intro =
    posts.length === 1
      ? "Bonjour,\n\nNotre dernière analyse pourrait vous intéresser :"
      : "Bonjour,\n\nVoici nos dernières analyses, sélectionnées pour vous :";

  const body =
    `${intro}\n\n` +
    posts
      .map(
        (p) =>
          `## ${p.meta.title}\n\n${p.meta.excerpt ?? ""}\n\n[Lire l'article →](${SITE_URL}/blog/${p.meta.slug})`,
      )
      .join("\n\n---\n\n") +
    `\n\nBonne lecture,\n\nL'équipe Trevys\n[www.trevys.fr](${SITE_URL})`;

  // Objet : saisi, sinon proposé par Alfred (ton chaleureux, pas trop sérieux).
  let subject = ((formData.get("subject") as string) || "").trim();
  if (!subject) {
    const { suggestSubject } = await import("@/lib/comms-agent");
    subject = await suggestSubject(body);
  }

  const c = addCampaign(subject, body);
  redirect(`/admin/communication/newsletter/${c.id}`);
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
    await sendCampaign([to], `[Test] ${c.subject}`, wrapEmail(markdownToEmailHtml(c.body), unsubscribeUrl(to)));
  } catch {
    redirect(`/admin/communication/newsletter/${id}?error=send`);
  }
  redirect(`/admin/communication/newsletter/${id}?tested=1`);
}

// Extrait et normalise une liste d'adresses (séparées par virgule, point-virgule,
// espace ou retour à la ligne), en supprimant les doublons.
function parseEmails(raw: string): string[] {
  const found = raw.match(/[^\s,;<>()"']+@[^\s,;<>()"']+\.[^\s,;<>()"']+/g) ?? [];
  return [...new Set(found.map((e) => e.trim().toLowerCase()))];
}

// Envoi de la campagne : inscrits newsletter et/ou liste de destinataires collée.
export async function sendCampaignAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  const c = getCampaign(id);
  if (!c) return;

  if (!mailerConfigured()) {
    redirect(`/admin/communication/newsletter/${id}?error=notconfig`);
  }

  const set = new Set<string>();
  if (formData.get("includeSubscribers")) {
    listSubscribers().forEach((s) => set.add(s.email.toLowerCase()));
  }
  parseEmails((formData.get("recipients") as string) || "").forEach((e) => set.add(e));
  const recipients = [...set];

  if (recipients.length === 0) {
    redirect(`/admin/communication/newsletter/${id}?error=empty`);
  }

  let count = 0;
  try {
    // Un e-mail par destinataire : lien de désinscription individuel +
    // pixel de suivi d'ouverture signé (statistiques par contact).
    const { openPixelUrl } = await import("@/lib/newsletter-stats");
    const bodyHtml = markdownToEmailHtml(c.body);
    count = await sendPersonalized(recipients, c.subject, (email) =>
      wrapEmail(bodyHtml, unsubscribeUrl(email)) +
      `<img src="${openPixelUrl(id, email)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`,
    );
    if (count === 0) redirect(`/admin/communication/newsletter/${id}?error=send`);
  } catch {
    redirect(`/admin/communication/newsletter/${id}?error=send`);
  }
  updateCampaign(id, { status: "envoye", sentAt: new Date().toISOString(), sentCount: count });
  revalidatePath("/admin/communication/newsletter");
  redirect(`/admin/communication/newsletter/${id}?sent=${count}`);
}
