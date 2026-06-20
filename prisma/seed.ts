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

  const clientData = {
    legalName: "SARL Dupont Construction",
    commercialName: "Dupont Construction",
    siren: "123456789",
    legalForm: "SARL",
    taxRegime: "IS",
    vatRegime: "Réel normal",
    address: "12 rue des Tisseurs",
    postalCode: "69002",
    city: "Lyon",
    assignedPartnerId: partner.id,
    assignedManagerId: manager.id,
    assignedCollaboratorId: collaborator.id,
    clientSince: new Date("2022-01-15"),
  };

  const client = await prisma.client.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: clientData,
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      ...clientData,
    },
  });

  const contact1Data = {
    clientId: client.id,
    firstName: "Marc",
    lastName: "Dupont",
    role: "Gérant",
    email: "marc.dupont@dupont-construction.fr",
    phone: "0478001122",
    whatsappPhone: "0612345678",
    isPrimary: true,
  };

  await prisma.clientContact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: contact1Data,
    create: { id: "00000000-0000-0000-0000-000000000002", ...contact1Data },
  });

  const contact2Data = {
    clientId: client.id,
    firstName: "Sophie",
    lastName: "Lambert",
    role: "Comptable interne",
    email: "s.lambert@dupont-construction.fr",
    phone: "0478001133",
    isPrimary: false,
  };

  await prisma.clientContact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: contact2Data,
    create: { id: "00000000-0000-0000-0000-000000000003", ...contact2Data },
  });

  const missionData = {
    name: "Tenue comptable mensuelle",
    category: "Comptabilité",
    defaultEstimatedHours: 4,
  };

  const mission = await prisma.mission.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: missionData,
    create: { id: "00000000-0000-0000-0000-000000000010", ...missionData },
  });

  const clientMissionData = {
    clientId: client.id,
    missionId: mission.id,
    recurrence: "mensuelle",
    feeAmount: 450,
    estimatedHours: 4,
    assignedUserId: collaborator.id,
  };

  await prisma.clientMission.upsert({
    where: { id: "00000000-0000-0000-0000-000000000020" },
    update: clientMissionData,
    create: { id: "00000000-0000-0000-0000-000000000020", ...clientMissionData },
  });

  const tasksData = [
    {
      id: "00000000-0000-0000-0000-000000000030",
      title: "Saisie comptable mai",
      status: "todo",
      kanbanColumn: "a_faire",
      priority: "normal",
    },
    {
      id: "00000000-0000-0000-0000-000000000031",
      title: "Déclaration TVA mai",
      status: "in_progress",
      kanbanColumn: "en_cours",
      priority: "high",
    },
    {
      id: "00000000-0000-0000-0000-000000000032",
      title: "Contrôle manager clôture avril",
      status: "review",
      kanbanColumn: "controle",
      priority: "normal",
    },
  ];

  for (const { id, ...task } of tasksData) {
    const taskData = {
      clientId: client.id,
      missionId: mission.id,
      assignedTo: collaborator.id,
      managerId: manager.id,
      ...task,
    };
    await prisma.task.upsert({
      where: { id },
      update: taskData,
      create: { id, ...taskData },
    });
  }

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
