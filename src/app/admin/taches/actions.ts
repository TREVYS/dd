"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { addTask, completeTask, reopenTask, removeTask, updateTask, normalizeDue, normalizePriority } from "@/lib/tasks";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

function refresh() {
  revalidatePath("/admin/taches");
  revalidatePath("/admin", "layout");
}

export async function addTaskAction(formData: FormData) {
  await guard();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  addTask({
    title,
    note: String(formData.get("note") ?? "") || undefined,
    due: normalizeDue(formData.get("due")),
    priority: normalizePriority(formData.get("priority")),
    source: "cockpit",
  });
  refresh();
}

export async function updateTaskAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  updateTask(id, {
    ...(title ? { title } : {}),
    note: String(formData.get("note") ?? "").trim() || undefined,
    due: normalizeDue(formData.get("due")),
    priority: normalizePriority(formData.get("priority")),
  });
  refresh();
}

export async function completeTaskAction(formData: FormData) {
  await guard();
  completeTask(String(formData.get("id") ?? ""));
  refresh();
}

export async function reopenTaskAction(formData: FormData) {
  await guard();
  reopenTask(String(formData.get("id") ?? ""));
  refresh();
}

export async function deleteTaskAction(formData: FormData) {
  await guard();
  removeTask(String(formData.get("id") ?? ""));
  refresh();
}
