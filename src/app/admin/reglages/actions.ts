"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";
import { disconnect, type Provider } from "@/lib/social";
import { writeSettings, type SettingKey } from "@/lib/settings";

const KEYS: SettingKey[] = [
  "anthropicApiKey", "telegramBotToken", "telegramChatId",
  "brevoApiKey", "brevoListId", "calendlyUrl",
  "linkedinClientId", "linkedinClientSecret",
  "instagramClientId", "instagramClientSecret",
];

// Enregistre les clés/API saisies dans le cockpit. Les champs laissés vides
// ne sont pas modifiés (pour ne pas effacer un secret déjà en place).
export async function saveSettingsAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const patch: Partial<Record<SettingKey, string>> = {};
  for (const k of KEYS) {
    const v = formData.get(k);
    if (typeof v === "string" && v.trim()) patch[k] = v.trim();
  }
  writeSettings(patch);
  revalidatePath("/admin/reglages");
  redirect("/admin/reglages?saved=1");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function disconnectSocialAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const provider = formData.get("provider") as Provider;
  disconnect(provider);
  revalidatePath("/admin/reglages");
}
