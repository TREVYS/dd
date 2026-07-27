"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const PATH = "/admin/communication/design";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

// Génère un visuel depuis le Studio design (maquette choisie ou rotation).
export async function designVisualAction(
  _prev: { url?: string; error?: string },
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await guard();
  try {
    const { makeInstagramVisual } = await import("@/lib/ig-visual");
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return { error: "Indiquez un titre pour le visuel." };
    const subtitle = String(formData.get("subtitle") ?? "").trim() || undefined;
    const template = String(formData.get("template") ?? "").trim() || undefined;
    const { url } = await makeInstagramVisual(title, subtitle, template);
    revalidatePath(PATH);
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// Crée un brouillon de post Instagram avec le visuel généré + la légende.
export async function draftFromVisualAction(formData: FormData) {
  await guard();
  const image = String(formData.get("image") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (!image) return;
  const { addPost } = await import("@/lib/social-posts");
  addPost({
    network: "instagram",
    content: caption || "[Légende à rédiger — demandez à Alfred si besoin]",
    status: "brouillon",
    image,
  });
  revalidatePath("/admin/communication/reseaux");
  const { redirect } = await import("next/navigation");
  redirect("/admin/communication/reseaux");
}

// Maquettes de fond (partagées avec Réglages · Studio Instagram).
export async function addTemplateAction(formData: FormData) {
  await guard();
  const { getStudio, saveStudio } = await import("@/lib/ig-studio");
  const url = String(formData.get("template") ?? "").trim();
  if (url) {
    const templates = getStudio().templates;
    if (!templates.includes(url)) saveStudio({ templates: [...templates, url] });
  }
  revalidatePath(PATH);
}

export async function removeTemplateAction(formData: FormData) {
  await guard();
  const { getStudio, saveStudio } = await import("@/lib/ig-studio");
  const url = String(formData.get("url") ?? "");
  saveStudio({ templates: getStudio().templates.filter((t) => t !== url) });
  revalidatePath(PATH);
}

export async function saveStyleAction(formData: FormData) {
  await guard();
  const { saveStudio } = await import("@/lib/ig-studio");
  saveStudio({ style: String(formData.get("style") ?? "").trim() });
  revalidatePath(PATH);
}

// Supprime un visuel généré (médiathèque, fichiers ig-*.png uniquement).
export async function deleteVisualAction(formData: FormData) {
  await guard();
  const name = String(formData.get("name") ?? "");
  if (/^ig-[\w.-]+\.png$/.test(name)) {
    const { deleteUpload } = await import("@/lib/media");
    deleteUpload(name);
  }
  revalidatePath(PATH);
}
