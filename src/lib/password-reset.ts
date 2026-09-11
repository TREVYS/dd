import crypto from "node:crypto";
import { appSecret } from "@/lib/app-secret";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Réinitialisation de mot de passe sans table dédiée : le jeton est signé et
// incorpore le hash du mot de passe ACTUEL — dès que le mot de passe change,
// tout ancien lien devient automatiquement invalide (usage unique, sans
// nettoyage à faire). Durée de vie : 1 heure.
const TTL_MS = 60 * 60 * 1000;

function sign(email: string, exp: number, passwordHash: string): string {
  return crypto
    .createHmac("sha256", appSecret())
    .update(`reset:${email.toLowerCase().trim()}:${exp}:${passwordHash}`)
    .digest("hex");
}

export function buildResetToken(email: string, passwordHash: string): string {
  const exp = Date.now() + TTL_MS;
  const sig = sign(email, exp, passwordHash);
  return Buffer.from(`${exp}.${sig}`).toString("base64url");
}

export function resetUrl(email: string, token: string): string {
  return `${SITE_URL}/login/reinitialiser?e=${encodeURIComponent(email)}&t=${token}`;
}

// Vérifie le jeton pour l'adresse donnée. Renvoie l'utilisateur si valide.
export async function verifyResetToken(email: string, token: string) {
  try {
    const [expStr, sig] = Buffer.from(token, "base64url").toString("utf8").split(".");
    const exp = Number(expStr);
    if (!exp || !sig || Date.now() > exp) return null;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !user.passwordHash || user.status !== "active") return null;
    const expected = sign(email, exp, user.passwordHash);
    if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
