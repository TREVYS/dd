import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendTelegram } from "@/lib/notify";

// Seuls ces rôles peuvent ouvrir une session (le cockpit est le seul espace
// connecté : les anciens comptes de démo Manager/Collaborateur sont refusés).
const LOGIN_ROLES = ["Administrateur", "Associé"];

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // Sécurité cockpit : la session expire au bout de 7 jours — mot de passe
    // redemandé environ 4 fois par mois, même en utilisation continue.
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 12 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });
        if (!user || !user.passwordHash) return null;
        if (user.status !== "active") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          // Alerte sur tentative échouée (si Telegram est configuré).
          sendTelegram(`⚠️ Tentative de connexion refusée pour ${email}.`).catch(() => {});
          return null;
        }

        // Le cockpit est réservé aux rôles autorisés.
        if (!LOGIN_ROLES.includes(user.role?.name ?? "")) return null;

        // Notification de connexion réussie (si Telegram est configuré).
        sendTelegram(`🔓 Connexion au cockpit : ${user.firstName} ${user.lastName} (${email}).`).catch(() => {});

        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string | null }).role ?? null;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null;
      }
      return session;
    },
  },
});
