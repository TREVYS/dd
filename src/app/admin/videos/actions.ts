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
