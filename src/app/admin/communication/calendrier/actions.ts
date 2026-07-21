"use server";

import { revalidatePath } from "next/cache";
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
    body: item.body,
  });
  updateItem(item.id, { status: "publie", slug });
  revalidatePath("/blog");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/communication/calendrier");
}
