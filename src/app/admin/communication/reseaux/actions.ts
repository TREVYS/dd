"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addPost, updatePost, deletePost, getPost, listPosts, type PostNetwork } from "@/lib/social-posts";
import { publishPost } from "@/lib/social";
import { draftSocialPost } from "@/lib/comms-agent";

const PATH = "/admin/communication/reseaux";

function net(v: FormDataEntryValue | null): PostNetwork {
  return v === "instagram" ? "instagram" : "linkedin";
}

// Rédige un post avec Alfred (retour texte pour préremplir le formulaire).
export async function draftPostAction(
  _prev: { content: string; generated: boolean; error?: string },
  formData: FormData,
): Promise<{ content: string; generated: boolean; error?: string }> {
  const topic = String(formData.get("topic") ?? "").trim();
  const network = net(formData.get("network"));
  if (!topic) return { content: "", generated: false, error: "Indiquez un sujet." };
  try {
    const { content, generated } = await draftSocialPost(topic, network);
    return { content, generated };
  } catch (e) {
    return { content: "", generated: false, error: (e as Error).message };
  }
}

export async function createPostAction(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const scheduledTime = String(formData.get("scheduledTime") ?? "");
  const image = String(formData.get("image") ?? "");
  addPost({
    network: net(formData.get("network")),
    content,
    status: scheduledDate ? "planifie" : "brouillon",
    scheduledDate: scheduledDate || undefined,
    scheduledTime: (scheduledDate && scheduledTime) || undefined,
    image: image || undefined,
  });
  revalidatePath(PATH);
}

export async function schedulePostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  const scheduledTime = String(formData.get("scheduledTime") ?? "");
  updatePost(id, {
    status: scheduledDate ? "planifie" : "brouillon",
    scheduledDate: scheduledDate || undefined,
    scheduledTime: (scheduledDate && scheduledTime) || undefined,
  });
  revalidatePath(PATH);
  revalidatePath("/admin/communication/planning");
}

export async function deletePostAction(formData: FormData) {
  deletePost(String(formData.get("id") ?? ""));
  revalidatePath(PATH);
}

// Vide d'un coup tous les brouillons de la file.
export async function deleteAllDraftsAction() {
  for (const p of listPosts()) {
    if (p.status === "brouillon") deletePost(p.id);
  }
  revalidatePath(PATH);
}

// Change (ou retire) l'image d'un post en attente.
export async function setPostImageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const image = String(formData.get("image") ?? "").trim();
  updatePost(id, { image: image || undefined });
  revalidatePath(PATH);
}

// Publie maintenant : tente l'envoi réel si le compte est connecté. En cas
// d'échec, le post RESTE en brouillon et l'erreur est affichée — on ne marque
// plus jamais « publié » un post qui n'est pas parti.
export async function publishPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const post = getPost(id);
  if (!post) return;
  const res = await publishPost(post.network, post.content, post.image);
  if (!res.ok) {
    revalidatePath(PATH);
    redirect(`${PATH}?puberr=${encodeURIComponent(res.error ?? "échec inconnu")}`);
  }
  updatePost(id, { status: "publie", publishedAt: new Date().toISOString() });
  revalidatePath(PATH);
}

// Déplacement d'une carte du planning (glisser-déposer) : change la date,
// garde l'heure. Un brouillon déposé sur un jour devient planifié.
export async function movePostAction(id: string, scheduledDate: string) {
  if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) return;
  updatePost(id, { status: "planifie", scheduledDate });
  revalidatePath("/admin/communication/planning");
  revalidatePath(PATH);
}

// Assistant de remplissage : Alfred prépare un planning de posts sur une
// semaine ou un mois (LinkedIn + Instagram, visuels générés), en planifié.
export async function generatePlanAction(formData: FormData) {
  const period = formData.get("period") === "mois" ? "mois" : "semaine";
  const { planPosts } = await import("@/lib/comms-agent");
  const n = await planPosts(period, {
    liPerWeek: Number(formData.get("liPerWeek") ?? 3),
    igPerWeek: Number(formData.get("igPerWeek") ?? 2),
    themes: String(formData.get("themes") ?? ""),
    liTime: String(formData.get("liTime") ?? ""),
    igTime: String(formData.get("igTime") ?? ""),
  });
  revalidatePath("/admin/communication/planning");
  redirect(`/admin/communication/planning?gen=${n}`);
}

// Aperçu du design Instagram (fenêtre de l'assistant) : génère un visuel
// d'exemple avec les maquettes du Studio, sans créer de post.
export async function previewIgVisualAction(
  _prev: { url?: string; error?: string },
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  try {
    const { makeInstagramVisual } = await import("@/lib/ig-visual");
    const title = String(formData.get("title") ?? "").trim() || "Votre titre ici";
    const subtitle = String(formData.get("subtitle") ?? "").trim() || undefined;
    const { url } = await makeInstagramVisual(title, subtitle);
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
