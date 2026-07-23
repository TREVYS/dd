"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { saveAlfred, addExample, removeExample, addKnowledge, removeKnowledge } from "@/lib/alfred-config";
import { extractFromBuffer, extractFromUrl } from "@/lib/extract";

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

// Éduquer Alfred avec un document (PDF, Word .docx, .txt/.md).
export async function addKnowledgeFileAction(formData: FormData) {
  await guard();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/communication/alfred?kerr=file");
  }
  const f = file as File;
  try {
    const buf = Buffer.from(await f.arrayBuffer());
    const text = await extractFromBuffer(buf, f.name, f.type);
    if (!text.trim()) throw new Error("empty");
    const title = ((formData.get("title") as string) || f.name).trim();
    addKnowledge(title, f.name, text);
  } catch {
    redirect("/admin/communication/alfred?kerr=extract");
  }
  revalidatePath("/admin/communication/alfred");
  redirect("/admin/communication/alfred?kok=1");
}

// Éduquer Alfred avec le contenu d'une page web.
export async function addKnowledgeUrlAction(formData: FormData) {
  await guard();
  const url = ((formData.get("url") as string) || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    redirect("/admin/communication/alfred?kerr=url");
  }
  try {
    const text = await extractFromUrl(url);
    if (!text.trim()) throw new Error("empty");
    const title = ((formData.get("title") as string) || url).trim();
    addKnowledge(title, url, text);
  } catch {
    redirect("/admin/communication/alfred?kerr=fetch");
  }
  revalidatePath("/admin/communication/alfred");
  redirect("/admin/communication/alfred?kok=1");
}

// Éduquer Alfred avec du texte collé directement.
export async function addKnowledgeTextAction(formData: FormData) {
  await guard();
  const text = ((formData.get("text") as string) || "").trim();
  if (!text) redirect("/admin/communication/alfred?kerr=empty");
  const title = ((formData.get("title") as string) || "Note").trim();
  addKnowledge(title, "Texte collé", text);
  revalidatePath("/admin/communication/alfred");
  redirect("/admin/communication/alfred?kok=1");
}

export async function removeKnowledgeAction(formData: FormData) {
  await guard();
  removeKnowledge(formData.get("id") as string);
  revalidatePath("/admin/communication/alfred");
}
