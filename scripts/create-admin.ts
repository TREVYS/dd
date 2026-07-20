/**
 * Crée (ou met à jour) le compte administrateur du back-office.
 * Le mot de passe n'est JAMAIS écrit dans le code : il est lu depuis les
 * variables d'environnement au moment de l'exécution.
 *
 * Usage (PowerShell) :
 *   $env:ADMIN_EMAIL="levy@trevys.fr"; $env:ADMIN_PASSWORD="********"; npx tsx scripts/create-admin.ts
 * Usage (bash) :
 *   ADMIN_EMAIL=levy@trevys.fr ADMIN_PASSWORD='********' npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST ?? "John";
  const lastName = process.env.ADMIN_LAST ?? "Lévy";

  if (!email || !password) {
    console.error("❌ Définissez ADMIN_EMAIL et ADMIN_PASSWORD avant de lancer ce script.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.warn("⚠️  Mot de passe court (< 8 caractères) — pensez à le renforcer.");
  }

  const role = await prisma.role.upsert({
    where: { name: "Administrateur" },
    update: {},
    create: { name: "Administrateur", description: "Accès complet au back-office" },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: "active", roleId: role.id },
    create: { email, firstName, lastName, passwordHash, status: "active", roleId: role.id },
  });

  console.log(`✅ Compte administrateur prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
