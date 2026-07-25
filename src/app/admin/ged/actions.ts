"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { removeKnowledge, setKnowledgeTheme } from "@/lib/alfred-config";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function setDocThemeAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  const theme = String(formData.get("theme") ?? "");
  if (id) setKnowledgeTheme(id, theme);
  revalidatePath("/admin/ged");
}

export async function deleteDocAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (id) removeKnowledge(id);
  revalidatePath("/admin/ged");
}
