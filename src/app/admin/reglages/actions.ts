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
  "msTenantId", "msClientId", "msClientSecret", "msSender",
  "recruitEmail",
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

// Active / désactive la conversation avec Alfred sur Telegram (webhook).
export async function enableTelegramAlfredAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const { enableAlfredOnTelegram } = await import("@/lib/telegram-alfred");
  const r = await enableAlfredOnTelegram();
  revalidatePath("/admin/reglages");
  redirect(`/admin/reglages?tga=${r.ok ? "on" : "err"}`);
}

export async function disableTelegramAlfredAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const { disableAlfredOnTelegram } = await import("@/lib/telegram-alfred");
  await disableAlfredOnTelegram();
  revalidatePath("/admin/reglages");
  redirect("/admin/reglages?tga=off");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

// Changement de mot de passe (self-service, mot de passe actuel exigé).
export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");

  const current = (formData.get("current") as string) || "";
  const next = (formData.get("next") as string) || "";
  const confirm = (formData.get("confirm") as string) || "";

  if (next.length < 10) redirect("/admin/reglages?pwd=short");
  if (next !== confirm) redirect("/admin/reglages?pwd=mismatch");

  const { prisma } = await import("@/lib/prisma");
  const bcrypt = (await import("bcryptjs")).default;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await bcrypt.compare(current, user.passwordHash))) {
    redirect("/admin/reglages?pwd=wrong");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
  redirect("/admin/reglages?pwd=ok");
}

export async function disconnectSocialAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const provider = formData.get("provider") as Provider;
  disconnect(provider);
  revalidatePath("/admin/reglages");
}
