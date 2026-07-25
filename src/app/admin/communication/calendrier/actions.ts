"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addItem, getItem, removeItem, updateItem, type ItemType } from "@/lib/editorial";
import { saveArticle } from "@/lib/content-admin";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function addCalendarAction(formData: FormData) {
  await guard();
  addItem({
    date: (formData.get("date") as string) || new Date().toISOString().slice(0, 10),
    type: ((formData.get("type") as string) || "idee") as ItemType,
    title: (formData.get("title") as string) || "Sans titre",
    status: "planifie",
  });
  revalidatePath("/admin/communication/calendrier");
}

export async function deleteCalendarAction(formData: FormData) {
  await guard();
  removeItem(formData.get("id") as string);
  revalidatePath("/admin/communication/calendrier");
}

// Enregistre les modifications d'un brouillon d'article (titre, contenu…).
export async function updateDraftAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  if (!id) return;
  updateItem(id, {
    title: (formData.get("title") as string) || "Sans titre",
    category: (formData.get("category") as string) || undefined,
    excerpt: (formData.get("excerpt") as string) || undefined,
    image: (formData.get("image") as string) || undefined,
    body: (formData.get("body") as string) || undefined,
  });
  revalidatePath("/admin/communication/calendrier");
  redirect("/admin/communication/calendrier?saved=1");
}

// Publie un brouillon d'article rédigé par l'IA vers le site (crée le MDX).
export async function publishDraftAction(formData: FormData) {
  await guard();
  const item = getItem(formData.get("id") as string);
  if (!item || item.type !== "article" || !item.body) return;
  const slug = saveArticle({
    title: item.title,
    date: new Date().toISOString().slice(0, 10),
    category: item.category || "Article",
    excerpt: item.excerpt || "",
    image: item.image || "",
    body: item.body,
  });
  // Publié → l'article vit désormais dans « Articles » : il sort des brouillons.
  removeItem(item.id);
  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/communication/calendrier");
  redirect(`/admin/articles/${slug}`);
}
