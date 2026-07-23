"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { addRoutine, getRoutine, removeRoutine, updateRoutine, type RoutineFreq, type RoutineType } from "@/lib/alfred-routines";
import { runRoutine } from "@/lib/alfred-routines-run";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
}

const PATH = "/admin/communication/routines";

export async function addRoutineAction(formData: FormData) {
  await guard();
  const freq = ((formData.get("freq") as string) || "hebdomadaire") as RoutineFreq;
  addRoutine({
    label: ((formData.get("label") as string) || "Routine").trim(),
    type: ((formData.get("type") as string) || "article") as RoutineType,
    freq,
    weekday: freq === "hebdomadaire" ? Number(formData.get("weekday") ?? 1) : undefined,
    monthday: freq === "mensuelle" ? Number(formData.get("monthday") ?? 1) : undefined,
    topic: ((formData.get("topic") as string) || "").trim(),
    enabled: true,
  });
  revalidatePath(PATH);
  redirect(`${PATH}?ok=1`);
}

export async function updateRoutineAction(formData: FormData) {
  await guard();
  const id = formData.get("id") as string;
  if (!id) return;
  const freq = ((formData.get("freq") as string) || "hebdomadaire") as RoutineFreq;
  updateRoutine(id, {
    label: ((formData.get("label") as string) || "Routine").trim(),
    type: ((formData.get("type") as string) || "article") as RoutineType,
    freq,
    weekday: freq === "hebdomadaire" ? Number(formData.get("weekday") ?? 1) : undefined,
    monthday: freq === "mensuelle" ? Number(formData.get("monthday") ?? 1) : undefined,
    topic: ((formData.get("topic") as string) || "").trim(),
  });
  revalidatePath(PATH);
  redirect(`${PATH}?ok=1`);
}

export async function toggleRoutineAction(formData: FormData) {
  await guard();
  const r = getRoutine(formData.get("id") as string);
  if (r) updateRoutine(r.id, { enabled: !r.enabled });
  revalidatePath(PATH);
}

export async function deleteRoutineAction(formData: FormData) {
  await guard();
  removeRoutine(formData.get("id") as string);
  revalidatePath(PATH);
}

// Exécution manuelle immédiate (« Exécuter maintenant »).
export async function runNowAction(formData: FormData) {
  await guard();
  const r = getRoutine(formData.get("id") as string);
  if (!r) return;
  try {
    const result = await runRoutine(r);
    updateRoutine(r.id, { lastRun: new Date().toISOString(), lastResult: result });
  } catch (e) {
    updateRoutine(r.id, { lastRun: new Date().toISOString(), lastResult: `Échec : ${(e as Error).message.slice(0, 160)}` });
  }
  revalidatePath(PATH);
  redirect(`${PATH}?ran=1`);
}
