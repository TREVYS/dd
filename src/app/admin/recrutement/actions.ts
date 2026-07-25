"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addJob, getJob, removeJob, updateJob, markApplicationRead, removeApplication, type JobStatus } from "@/lib/jobs";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const PATH = "/admin/recrutement";

function refresh() {
  revalidatePath(PATH);
  revalidatePath("/nous-rejoindre");
}

export async function saveJobAction(formData: FormData) {
  await guard();
  const id = (formData.get("id") as string) || "";
  const data = {
    title: ((formData.get("title") as string) || "Sans titre").trim(),
    category: ((formData.get("category") as string) || "Expertise comptable").trim(),
    contract: ((formData.get("contract") as string) || "CDI").trim(),
    location: ((formData.get("location") as string) || "Paris 16e").trim(),
    summary: ((formData.get("summary") as string) || "").trim(),
    body: (formData.get("body") as string) || "",
    status: (((formData.get("status") as string) || "brouillon") as JobStatus),
  };
  if (id) {
    updateJob(id, data);
  } else {
    addJob(data);
  }
  refresh();
  redirect(`${PATH}?ok=1`);
}

export async function toggleJobAction(formData: FormData) {
  await guard();
  const j = getJob(formData.get("id") as string);
  if (j) updateJob(j.id, { status: j.status === "publie" ? "brouillon" : "publie" });
  refresh();
}

export async function deleteJobAction(formData: FormData) {
  await guard();
  removeJob(formData.get("id") as string);
  refresh();
}

export async function markAppReadAction(formData: FormData) {
  await guard();
  markApplicationRead(formData.get("id") as string);
  revalidatePath(PATH);
}

export async function deleteAppAction(formData: FormData) {
  await guard();
  removeApplication(formData.get("id") as string);
  revalidatePath(PATH);
}
