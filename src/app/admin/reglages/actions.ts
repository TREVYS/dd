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
  "recruitEmail", "linkedinOrgId",
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

  if (next.length < 10) redirect("/admin/reglages/securite?pwd=short");
  if (next !== confirm) redirect("/admin/reglages/securite?pwd=mismatch");

  const { prisma } = await import("@/lib/prisma");
  const bcrypt = (await import("bcryptjs")).default;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash || !(await bcrypt.compare(current, user.passwordHash))) {
    redirect("/admin/reglages/securite?pwd=wrong");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
  redirect("/admin/reglages/securite?pwd=ok");
}

export async function disconnectSocialAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const provider = formData.get("provider") as Provider;
  disconnect(provider);
  revalidatePath("/admin/reglages");
}

// --- Studio Instagram -----------------------------------------------------
// Goûts visuels + maquettes de fond utilisés pour générer les visuels des
// posts Instagram (par Alfred ou depuis le composeur).

export async function saveIgStudioAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const { getStudio, saveStudio } = await import("@/lib/ig-studio");
  const style = String(formData.get("style") ?? "").trim();
  const add = String(formData.get("addTemplate") ?? "").trim();
  const templates = [...getStudio().templates];
  if (add && !templates.includes(add)) templates.push(add);
  saveStudio({ style, templates });
  revalidatePath("/admin/reglages");
  redirect("/admin/reglages?saved=1");
}

export async function removeIgTemplateAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const { getStudio, saveStudio } = await import("@/lib/ig-studio");
  const url = String(formData.get("url") ?? "");
  saveStudio({ templates: getStudio().templates.filter((t) => t !== url) });
  revalidatePath("/admin/reglages");
}

// Génère un visuel d'essai pour vérifier le rendu des maquettes.
export async function testIgVisualAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");
  const { makeInstagramVisual } = await import("@/lib/ig-visual");
  const { url } = await makeInstagramVisual(
    "La facturation électronique, sans jargon",
    "Le point en 3 minutes par Trevys",
  );
  redirect(`/admin/reglages?igtest=${encodeURIComponent(url)}`);
}
