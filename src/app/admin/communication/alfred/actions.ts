"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveAlfred, addExample, removeExample } from "@/lib/alfred-config";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function saveAlfredAction(formData: FormData) {
  await guard();
  saveAlfred({
    ton: (formData.get("ton") as string) ?? "",
    ligneEditoriale: (formData.get("ligneEditoriale") as string) ?? "",
    messagesCles: (formData.get("messagesCles") as string) ?? "",
    motsInterdits: (formData.get("motsInterdits") as string) ?? "",
    signature: (formData.get("signature") as string) ?? "",
  });
  revalidatePath("/admin/communication/alfred");
}

export async function addExampleAction(formData: FormData) {
  await guard();
  const content = ((formData.get("content") as string) ?? "").trim();
  if (content) addExample(((formData.get("label") as string) ?? "").trim(), content);
  revalidatePath("/admin/communication/alfred");
}

export async function removeExampleAction(formData: FormData) {
  await guard();
  removeExample(formData.get("id") as string);
  revalidatePath("/admin/communication/alfred");
}
