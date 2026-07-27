"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addVideo, removeVideo, parseYouTubeId } from "@/lib/videos";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

export async function addVideoAction(formData: FormData) {
  await guard();
  const youtubeId = parseYouTubeId((formData.get("url") as string) || "");
  if (!youtubeId) {
    redirect("/admin/videos?err=url");
  }
  // Vérification d'existence : la vidéo doit répondre sur YouTube (sinon la
  // miniature serait cassée dans la newsletter et sur le site).
  try {
    const check = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://youtu.be/${youtubeId}`)}&format=json`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (check.status === 404 || check.status === 400) redirect("/admin/videos?err=notfound");
  } catch (e) {
    // redirect() lève une exception interne Next : on la laisse passer.
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    // Réseau indisponible : on n'empêche pas l'enregistrement.
  }
  addVideo({
    youtubeId,
    title: ((formData.get("title") as string) || "Vidéo").trim(),
    focus: ((formData.get("focus") as string) || "").trim(),
    date: ((formData.get("date") as string) || "").trim() || undefined,
    note: ((formData.get("note") as string) || "").trim() || undefined,
  });
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
  redirect("/admin/videos?ok=1");
}

export async function removeVideoAction(formData: FormData) {
  await guard();
  removeVideo(formData.get("id") as string);
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
}
