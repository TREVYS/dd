import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureClientFolderTree } from "../src/lib/ged";

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

  await ensureClientFolderTree(client.id);

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
      dueDate: new Date(),
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
    update: { assignedTo: collaborator.id },
    create: {
      ticketNumber: "TCK-0001",
      clientId: client.id,
      source: "client",
      subject: "Question sur la TVA du mois",
      status: "new",
      createdBy: collaborator.id,
      assignedTo: collaborator.id,
    },
  });

  const mailsData = [
    {
      id: "00000000-0000-0000-0000-000000000040",
      fromName: "Marc Dupont",
      fromEmail: "marc.dupont@dupont-construction.fr",
      subject: "Justificatifs de mai à transmettre",
      body: "Bonjour, je vous transmets les relevés bancaires et factures du mois de mai en pièce jointe. Pouvez-vous me confirmer la bonne réception ?",
      status: "a_traiter",
      isRead: false,
    },
    {
      id: "00000000-0000-0000-0000-000000000041",
      fromName: "URSSAF",
      fromEmail: "contact@urssaf.fr",
      subject: "Échéance de cotisations à venir",
      body: "Rappel : l'échéance de cotisations sociales du client SARL Dupont Construction est due le 5 du mois prochain.",
      status: "a_traiter",
      isRead: false,
    },
    {
      id: "00000000-0000-0000-0000-000000000042",
      fromName: "Sophie Lambert",
      fromEmail: "s.lambert@dupont-construction.fr",
      subject: "Question sur la déclaration TVA",
      body: "Bonjour, j'ai une question sur le taux de TVA à appliquer pour notre dernière facture fournisseur. Merci de me rappeler.",
      status: "traite",
      isRead: true,
    },
  ];

  for (const { id, ...mailFields } of mailsData) {
    const mailData = { clientId: client.id, recipientId: collaborator.id, ...mailFields };
    await prisma.mail.upsert({
      where: { id },
      update: mailData,
      create: { id, ...mailData },
    });
  }

  const announcementsData = [
    {
      id: "00000000-0000-0000-0000-000000000050",
      category: "fiscalite",
      title: "Taux de TVA réduit reconduit",
      content:
        "Le taux de TVA réduit à 10% sur les travaux de rénovation énergétique est reconduit pour l'année en cours. Pensez à vérifier les factures de vos clients du BTP.",
    },
    {
      id: "00000000-0000-0000-0000-000000000051",
      category: "attention",
      title: "Clôtures d'avril en retard",
      content:
        "Plusieurs dossiers de clôture d'avril ne sont pas encore finalisés. Merci de prioriser ces dossiers avant la fin de la semaine.",
    },
    {
      id: "00000000-0000-0000-0000-000000000052",
      category: "objectif",
      title: "Objectif du mois : satisfaction client",
      content:
        "Ce mois-ci, l'objectif du cabinet est de réduire le délai moyen de réponse aux mails clients à moins de 24h.",
    },
  ];

  for (const a of announcementsData) {
    const data = { ...a, createdById: partner.id };
    await prisma.announcement.upsert({
      where: { id: a.id },
      update: data,
      create: data,
    });
  }

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
