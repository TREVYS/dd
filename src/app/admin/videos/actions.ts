"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addVideo, removeVideo, updateVideo, parseYouTubeId, setVideosPlacement, reorderVideos, type VideosPlacement } from "@/lib/videos";

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
  // Description : reprise si saisie à la main, sinon récupérée automatiquement
  // depuis YouTube si une clé API est configurée (Réglages).
  let description = ((formData.get("description") as string) || "").trim();
  if (!description) {
    const { fetchVideoDescription } = await import("@/lib/youtube-sync");
    description = (await fetchVideoDescription(youtubeId)) || "";
  }
  addVideo({
    youtubeId,
    title: ((formData.get("title") as string) || "Vidéo").trim(),
    focus: ((formData.get("focus") as string) || "").trim(),
    date: ((formData.get("date") as string) || "").trim() || undefined,
    note: ((formData.get("note") as string) || "").trim() || undefined,
    description: description || undefined,
    source: "manual",
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

export async function updateVideoDescriptionAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  const description = ((formData.get("description") as string) || "").trim();
  updateVideo(id, { description: description || undefined });
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
  redirect("/admin/videos?ok=desc");
}

export async function setPlacementAction(formData: FormData) {
  await guard();
  const placement = formData.get("placement") as VideosPlacement;
  if (placement === "top" || placement === "bottom" || placement === "hidden") {
    setVideosPlacement(placement);
  }
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
  redirect("/admin/videos?ok=placement");
}

export async function reorderVideosAction(orderedIds: string[]) {
  await guard();
  reorderVideos(orderedIds);
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
}

export async function syncYoutubeNowAction() {
  await guard();
  const { syncYoutubeVideos } = await import("@/lib/youtube-sync");
  const { added, error } = await syncYoutubeVideos();
  revalidatePath("/admin/videos");
  revalidatePath("/blog");
  if (error) redirect(`/admin/videos?err=sync&msg=${encodeURIComponent(error)}`);
  redirect(`/admin/videos?ok=sync&n=${added.length}`);
}
