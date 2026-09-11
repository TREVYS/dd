"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildResetToken, resetUrl, verifyResetToken } from "@/lib/password-reset";
import { mailerConfigured, sendMail } from "@/lib/mailer";
import { sendTelegram } from "@/lib/notify";

export type ForgotState = { sent: boolean; message: string };
export type ResetState = { ok: boolean; message: string };

// Toujours le même message, que l'e-mail existe ou non : on ne révèle jamais
// si une adresse est enregistrée dans le cockpit.
const GENERIC_MSG =
  "Si cette adresse est associée à un compte, un e-mail de réinitialisation vient d'être envoyé.";

export async function requestPasswordResetAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { sent: false, message: "Adresse e-mail requise." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.passwordHash && user.status === "active" && mailerConfigured()) {
      const token = buildResetToken(email, user.passwordHash);
      const url = resetUrl(email, token);
      await sendMail({
        to: [email],
        subject: "Réinitialisation de votre mot de passe — Trevys",
        bcc: false,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1208;line-height:1.6;">
            <p>Bonjour ${user.firstName},</p>
            <p>Une demande de réinitialisation de mot de passe a été faite pour le cockpit Trevys.</p>
            <p><a href="${url}" style="display:inline-block;padding:12px 26px;background:#E26A0F;color:#fff;border-radius:100px;text-decoration:none;font-weight:bold;">Choisir un nouveau mot de passe</a></p>
            <p style="color:#8a8378;font-size:13px;">Ce lien est valable 1 heure et ne peut servir qu'une fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — rien ne change.</p>
          </div>`,
      });
      sendTelegram(`🔑 Demande de réinitialisation de mot de passe pour ${email}.`).catch(() => {});
    }
  } catch (e) {
    console.error("[password-reset] demande:", e);
  }
  // Réponse générique dans tous les cas (adresse inconnue, mailer absent…).
  return { sent: true, message: GENERIC_MSG };
}

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 10 caractères." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Les deux mots de passe ne correspondent pas." };
  }

  const user = await verifyResetToken(email, token);
  if (!user) {
    return { ok: false, message: "Ce lien a expiré ou a déjà été utilisé — refaites une demande." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  sendTelegram(`🔓 Mot de passe réinitialisé pour ${email}.`).catch(() => {});

  return { ok: true, message: "Mot de passe mis à jour — vous pouvez vous connecter." };
}
