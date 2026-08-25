"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { markAllRead, listSubscribers, removeSubscriber, updateSubscriber, importContacts, parseContactsFile } from "@/lib/newsletter";
import {
  addCampaign,
  getCampaign,
  updateCampaign,
  removeCampaign,
  markdownToEmailHtml,
  wrapEmail,
  unsubscribeUrl,
  resolveTargetRecipients,
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

// Import en masse d'un fichier plat de contacts (CSV/TSV — colonnes email,
// nom, client, profil dans n'importe quel ordre, avec ou sans en-tête).
export async function importContactsAction(formData: FormData) {
  await guard();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) redirect("/admin/communication/newsletter?imp=empty");
  if (file.size > 4 * 1024 * 1024) redirect("/admin/communication/newsletter?imp=toobig");
  const text = Buffer.from(await file.arrayBuffer()).toString("utf8");
  const rows = parseContactsFile(text);
  if (rows.length === 0) redirect("/admin/communication/newsletter?imp=none");
  const res = importContacts(rows);
  revalidatePath("/admin/communication/newsletter");
  redirect(`/admin/communication/newsletter?imp=ok&a=${res.added}&u=${res.updated}&s=${res.skipped}`);
}

// Met à jour les catégories d'un contact (client du cabinet / profil / nom).
export async function updateSubscriberAction(formData: FormData) {
  await guard();
  const email = (formData.get("email") as string) || "";
  if (!email) return;
  updateSubscriber(email, {
    name: ((formData.get("name") as string) || "").trim() || undefined,
    client: formData.get("client") === "on",
    profil: ((formData.get("profil") as string) || "").trim() || undefined,
  });
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
  const { articleMetier, METIERS } = await import("@/lib/metier");
  const posts = slugs
    .map((s) => getPost(s))
    .filter((p): p is NonNullable<ReturnType<typeof getPost>> => !!p);

  const intro =
    posts.length === 1
      ? "Bonjour,\n\nNotre dernière analyse pourrait vous intéresser :"
      : "Bonjour,\n\nVoici nos dernières analyses, sélectionnées pour vous :";

  // Vidéo à partager (optionnelle) : carte miniature + bouton dans l'e-mail.
  let videoBlock = "";
  const videoId = ((formData.get("video") as string) || "").trim();
  if (videoId) {
    const { listVideos } = await import("@/lib/videos");
    const v = listVideos().find((x) => x.id === videoId);
    if (v) {
      videoBlock = `\n\n---\n\n### En vidéo\n\n[${v.title}](https://youtu.be/${v.youtubeId})`;
    }
  }

  // Articles regroupés en blocs métier : Consulting / Expertise comptable /
  // Transverse (seuls les blocs non vides apparaissent). La couverture de
  // chaque article apparaît en petite vignette, alternée droite / gauche.
  let n = 0;
  const blocks = METIERS.map((m) => {
    const inBlock = posts.filter((p) => articleMetier(p.meta) === m);
    if (inBlock.length === 0) return "";
    return (
      `[[${m}]]\n` +
      inBlock
        .map((p) => {
          const side = n++ % 2 === 0 ? "droite" : "gauche";
          const cover = p.meta.image ? `![${p.meta.title}|${side}](${p.meta.image})\n\n` : "";
          return `### ${p.meta.title}\n\n${cover}${p.meta.excerpt ?? ""}\n\n[Lire l'article →](${SITE_URL}/blog/${p.meta.slug})`;
        })
        .join("\n\n")
    );
  }).filter(Boolean);

  const body =
    `${intro}\n\n` +
    blocks.join("\n\n---\n\n") +
    videoBlock +
    `\n\n---\n\n` +
    `Bonne lecture — et si un article vous trotte dans la tête, répondez-nous : un humain (pas un robot) vous lira.\n\n` +
    `**L'équipe Trevys**\n\n` +
    `[Découvrir www.trevys.fr](${SITE_URL})\n\n` +
    `PS : les coulisses, les débats et un peu d'audace, c'est [sur LinkedIn](https://www.linkedin.com/company/trevys-advisory/) que ça se passe.`;

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
  let subject = ((formData.get("subject") as string) || "").trim();
  let body = ((formData.get("body") as string) || "").trim();
  const brief = ((formData.get("brief") as string) || "").trim();

  // Brief fourni sans texte : Alfred rédige le premier jet (relu et modifiable
  // sur la page d'édition avant tout envoi).
  if (!body && brief) {
    try {
      const { draftMailingBody } = await import("@/lib/comms-agent");
      body = await draftMailingBody(brief);
    } catch (e) {
      console.error("[newsletter] brouillon Alfred:", e);
      redirect("/admin/communication/newsletter?vue=preparation&error=alfred");
    }
  }
  if (!subject && body) {
    const { suggestSubject } = await import("@/lib/comms-agent");
    subject = await suggestSubject(body);
  }

  const c = addCampaign(subject || "Sans objet", body);
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

  const recipients = resolveTargetRecipients(targetFromForm(formData), listSubscribers());

  if (recipients.length === 0) {
    redirect(`/admin/communication/newsletter/${id}?error=empty`);
  }

  let count = 0;
  try {
    // Un e-mail par destinataire : lien de désinscription individuel,
    // pixel d'ouverture signé, et liens réécrits pour le suivi des clics.
    const { openPixelUrl, trackLinks } = await import("@/lib/newsletter-stats");
    const bodyHtml = markdownToEmailHtml(c.body);
    count = await sendPersonalized(recipients, c.subject, (email) =>
      trackLinks(wrapEmail(bodyHtml, unsubscribeUrl(email)), id, email) +
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

// Campagne d'opt-in : invite une base de contacts à choisir OUI/NON pour
// recevoir les analyses. Les déjà-inscrits, les refus passés et les contacts
// déjà invités sont automatiquement écartés.
export async function sendOptinInvitesAction(formData: FormData) {
  await guard();
  if (!mailerConfigured()) redirect("/admin/communication/newsletter?optin=notconfig");

  const raw = (formData.get("contacts") as string) || "";
  const all = parseEmails(raw);
  if (all.length === 0) redirect("/admin/communication/newsletter?optin=empty");

  const { isDeclined, isInvited, markInvited, buildOptinEmail, OPTIN_SUBJECT } = await import("@/lib/newsletter-optin");
  const { listUnsubscribed } = await import("@/lib/newsletter");
  const existing = new Set(listSubscribers().map((x) => x.email.toLowerCase()));
  const unsub = new Set(listUnsubscribed().map((u) => u.email));
  const targets = all.filter((e) => !existing.has(e) && !unsub.has(e) && !isDeclined(e) && !isInvited(e));
  if (targets.length === 0) redirect("/admin/communication/newsletter?optin=none");

  const sent = await sendPersonalized(targets, OPTIN_SUBJECT, (email) => buildOptinEmail(email));
  targets.forEach((e) => markInvited(e));
  revalidatePath("/admin/communication/newsletter");
  redirect(`/admin/communication/newsletter?optin=sent&n=${sent}&skipped=${all.length - targets.length}`);
}

// Reconstruit le ciblage depuis le formulaire d'envoi/programmation.
function targetFromForm(formData: FormData) {
  return {
    includeSubscribers: !!formData.get("includeSubscribers"),
    fClient: (formData.get("fClient") as string) || "tous",
    fProfil: ((formData.get("fProfil") as string) || "").trim(),
    fq: ((formData.get("fq") as string) || "").trim(),
    exclude: parseEmails((formData.get("exclude") as string) || ""),
    extra: parseEmails((formData.get("recipients") as string) || ""),
  };
}

// Programme (ou annule la programmation de) l'envoi d'un mailing en brouillon.
// Le ciblage choisi à l'écran est mémorisé : à la date venue, le planificateur
// envoie aux MÊMES destinataires (recalculés sur la base à jour).
export async function scheduleCampaignAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  const sendAt = ((formData.get("sendAt") as string) || "").trim();
  if (!id) return;
  updateCampaign(id, {
    sendAt: sendAt || undefined,
    target: sendAt ? targetFromForm(formData) : undefined,
  });
  revalidatePath(`/admin/communication/newsletter/${id}`);
  revalidatePath("/admin/communication/mailings");
  redirect(`/admin/communication/newsletter/${id}?planned=${sendAt ? "1" : "0"}`);
}
