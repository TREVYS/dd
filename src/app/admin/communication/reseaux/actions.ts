"use server";

import { revalidatePath } from "next/cache";
import { addPost, updatePost, deletePost, getPost, type PostNetwork } from "@/lib/social-posts";
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
  const image = String(formData.get("image") ?? "");
  addPost({
    network: net(formData.get("network")),
    content,
    status: scheduledDate ? "planifie" : "brouillon",
    scheduledDate: scheduledDate || undefined,
    image: image || undefined,
  });
  revalidatePath(PATH);
}

export async function schedulePostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const scheduledDate = String(formData.get("scheduledDate") ?? "");
  updatePost(id, { status: scheduledDate ? "planifie" : "brouillon", scheduledDate: scheduledDate || undefined });
  revalidatePath(PATH);
}

export async function deletePostAction(formData: FormData) {
  deletePost(String(formData.get("id") ?? ""));
  revalidatePath(PATH);
}

// Publie maintenant : tente l'envoi réel si le compte est connecté, sinon
// marque « publié » manuellement (l'envoi réel s'activera à la connexion).
export async function publishPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const post = getPost(id);
  if (!post) return;
  const res = await publishPost(post.network, post.content);
  if (res.ok) {
    updatePost(id, { status: "publie", publishedAt: new Date().toISOString() });
  } else {
    // Compte non connecté : on marque comme publié manuellement (traçabilité).
    updatePost(id, { status: "publie", publishedAt: new Date().toISOString() });
  }
  revalidatePath(PATH);
}
