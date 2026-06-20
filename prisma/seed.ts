import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roleNames = ["Associé", "Manager", "Collaborateur"];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles[name] = role.id;
  }

  const passwordHash = await bcrypt.hash("trevys2024", 10);

  const partner = await prisma.user.upsert({
    where: { email: "associe@trevys-advisory.fr" },
    update: {},
    create: {
      firstName: "Camille",
      lastName: "Trevys",
      email: "associe@trevys-advisory.fr",
      passwordHash,
      roleId: roles["Associé"],
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@trevys-advisory.fr" },
    update: {},
    create: {
      firstName: "Nora",
      lastName: "Lefèvre",
      email: "manager@trevys-advisory.fr",
      passwordHash,
      roleId: roles["Manager"],
      managerId: partner.id,
    },
  });

  const collaborator = await prisma.user.upsert({
    where: { email: "collab@trevys-advisory.fr" },
    update: {},
    create: {
      firstName: "Yanis",
      lastName: "Morel",
      email: "collab@trevys-advisory.fr",
      passwordHash,
      roleId: roles["Collaborateur"],
      managerId: manager.id,
    },
  });

  const client = await prisma.client.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      legalName: "SARL Dupont Construction",
      commercialName: "Dupont Construction",
      siren: "123456789",
      legalForm: "SARL",
      taxRegime: "IS",
      vatRegime: "Réel normal",
      city: "Lyon",
      assignedPartnerId: partner.id,
      assignedManagerId: manager.id,
      assignedCollaboratorId: collaborator.id,
      clientSince: new Date("2022-01-15"),
    },
  });

  const mission = await prisma.mission.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      name: "Tenue comptable mensuelle",
      category: "Comptabilité",
      defaultEstimatedHours: 4,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        clientId: client.id,
        missionId: mission.id,
        assignedTo: collaborator.id,
        managerId: manager.id,
        title: "Saisie comptable mai",
        status: "todo",
        kanbanColumn: "a_faire",
        priority: "normal",
      },
      {
        clientId: client.id,
        missionId: mission.id,
        assignedTo: collaborator.id,
        managerId: manager.id,
        title: "Déclaration TVA mai",
        status: "in_progress",
        kanbanColumn: "en_cours",
        priority: "high",
      },
      {
        clientId: client.id,
        missionId: mission.id,
        assignedTo: collaborator.id,
        managerId: manager.id,
        title: "Contrôle manager clôture avril",
        status: "review",
        kanbanColumn: "controle",
        priority: "normal",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.ticket.upsert({
    where: { ticketNumber: "TCK-0001" },
    update: {},
    create: {
      ticketNumber: "TCK-0001",
      clientId: client.id,
      source: "client",
      subject: "Question sur la TVA du mois",
      status: "new",
      createdBy: collaborator.id,
    },
  });

  console.log("Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
