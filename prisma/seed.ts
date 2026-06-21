import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ensureClientFolderTree } from "../src/lib/ged";

const prisma = new PrismaClient();

const MODULES = [
  { key: "crm", label: "CRM" },
  { key: "production", label: "Production" },
  { key: "ged", label: "GED" },
  { key: "juridique", label: "Juridique" },
  { key: "academy", label: "Academy" },
  { key: "assistant_ia", label: "Assistant IA" },
  { key: "knowledge_cabinet", label: "Knowledge Cabinet" },
  { key: "ticketing", label: "Ticketing" },
  { key: "reporting", label: "Reporting" },
];

const DEFAULT_ROLE_MODULES: Record<string, string[]> = {
  Administrateur: MODULES.map((m) => m.key),
  Associé: MODULES.map((m) => m.key),
  Manager: ["crm", "production", "ged", "juridique", "assistant_ia", "knowledge_cabinet", "ticketing", "reporting"],
  Collaborateur: ["crm", "production", "ged", "juridique", "assistant_ia", "knowledge_cabinet", "ticketing"],
};

async function main() {
  const roleNames = ["Associé", "Manager", "Collaborateur", "Administrateur"];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles[name] = role.id;
  }

  const permissions: Record<string, string> = {};
  for (const m of MODULES) {
    const code = `module:${m.key}:access`;
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { label: `Accès module ${m.label}`, module: m.key },
      create: { code, label: `Accès module ${m.label}`, module: m.key },
    });
    permissions[m.key] = permission.id;
  }

  for (const [roleName, moduleKeys] of Object.entries(DEFAULT_ROLE_MODULES)) {
    for (const key of moduleKeys) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: roles[roleName], permissionId: permissions[key] } },
        update: {},
        create: { roleId: roles[roleName], permissionId: permissions[key] },
      });
    }
  }

  const team = await prisma.team.upsert({
    where: { id: "00000000-0000-0000-0000-000000000900" },
    update: { name: "Pôle Comptabilité" },
    create: { id: "00000000-0000-0000-0000-000000000900", name: "Pôle Comptabilité" },
  });

  const passwordHash = await bcrypt.hash("trevys2024", 10);

  await prisma.user.upsert({
    where: { email: "admin@trevys-advisory.fr" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "TREVYS",
      email: "admin@trevys-advisory.fr",
      passwordHash,
      roleId: roles["Administrateur"],
      jobTitle: "Administrateur système",
    },
  });

  const partner = await prisma.user.upsert({
    where: { email: "associe@trevys-advisory.fr" },
    update: {},
    create: {
      firstName: "Camille",
      lastName: "Trevys",
      email: "associe@trevys-advisory.fr",
      passwordHash,
      roleId: roles["Associé"],
      jobTitle: "Associée fondatrice",
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
      jobTitle: "Manager comptable",
      department: "Comptabilité",
      office: "Lyon",
      teamId: team.id,
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
      jobTitle: "Collaborateur comptable",
      department: "Comptabilité",
      office: "Lyon",
      teamId: team.id,
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

  const knowledgeArticleData = [
    {
      id: "00000000-0000-0000-0000-000000000100",
      category: "Fiscalité",
      title: "Régime micro-BIC : seuils et plafonds",
      content:
        "Le régime micro-BIC s'applique aux entreprises individuelles dont le chiffre d'affaires n'excède pas 188 700 € (vente de marchandises) ou 77 700 € (prestations de services et professions libérales BIC). L'abattement forfaitaire pour frais est de 71% pour la vente de marchandises et de 50% pour les prestations de services. Au-delà des seuils, le client bascule au régime réel simplifié dès le 1er janvier suivant le dépassement.",
      tags: "micro-bic,seuils,régime réel,entreprise individuelle",
    },
    {
      id: "00000000-0000-0000-0000-000000000101",
      category: "Fiscalité",
      title: "Acomptes d'impôt sur les sociétés : échéances",
      content:
        "Les sociétés soumises à l'IS versent quatre acomptes (15 mars, 15 juin, 15 septembre, 15 décembre) calculés sur le résultat de l'exercice précédent, sauf exonération la première année d'activité ou si l'IS dû est inférieur à 3 000 €. Le solde est régularisé au plus tard le 15 du 4e mois suivant la clôture de l'exercice via le relevé de solde n°2572.",
      tags: "is,acompte,échéance,relevé de solde",
    },
    {
      id: "00000000-0000-0000-0000-000000000102",
      category: "Comptabilité",
      title: "Procédure de clôture mensuelle des comptes clients",
      content:
        "Chaque clôture mensuelle suit les étapes suivantes : 1) rapprochement bancaire complet, 2) contrôle des comptes d'attente et de régularisation, 3) vérification des amortissements et provisions, 4) rapprochement de la TVA collectée/déductible avec la déclaration, 5) revue analytique (variations significatives vs mois précédent), 6) validation par le manager avant transmission au client.",
      tags: "clôture,rapprochement bancaire,procédure,révision",
    },
    {
      id: "00000000-0000-0000-0000-000000000103",
      category: "Comptabilité",
      title: "Traitement comptable des notes de frais",
      content:
        "Les notes de frais sont enregistrées au compte 625 (déplacements) ou 6256 (réceptions) selon leur nature, avec récupération de la TVA déductible si justificatif conforme (facture nominative, mention de la TVA). Les frais de réception et cadeaux clients sont plafonnés fiscalement (cadeaux > 73 € TTC par bénéficiaire et par an à déclarer sur le relevé des frais généraux n°2067 si le total dépasse 3 000 €).",
      tags: "notes de frais,tva déductible,frais généraux",
    },
    {
      id: "00000000-0000-0000-0000-000000000104",
      category: "Social",
      title: "Calcul des indemnités de rupture conventionnelle",
      content:
        "L'indemnité de rupture conventionnelle ne peut être inférieure à l'indemnité légale de licenciement : 1/4 de mois de salaire par année d'ancienneté jusqu'à 10 ans, puis 1/3 de mois par année au-delà. Elle est exonérée de cotisations sociales et de CSG/CRDS dans la limite du plus élevé entre 2 PASS et le montant légal ou conventionnel, sauf si le salarié peut faire liquider sa pension de retraite.",
      tags: "rupture conventionnelle,indemnité,charges sociales",
    },
    {
      id: "00000000-0000-0000-0000-000000000105",
      category: "Social",
      title: "Gestion des arrêts de travail et IJSS",
      content:
        "Lors d'un arrêt de travail, l'employeur doit transmettre l'attestation de salaire à la CPAM dans les 5 jours ouvrés. Le maintien de salaire conventionnel se calcule en complément des indemnités journalières de sécurité sociale (IJSS), généralement après un délai de carence de 7 jours pour la maladie. Les IJSS sont soumises à CSG/CRDS et imposables, à reporter en subrogation si l'employeur les perçoit directement.",
      tags: "arrêt de travail,ijss,maintien de salaire,carence",
    },
    {
      id: "00000000-0000-0000-0000-000000000106",
      category: "Juridique",
      title: "Choix de la forme juridique : SASU vs EURL",
      content:
        "La SASU offre un régime de protection sociale assimilé-salarié pour le président (sans cotisations chômage) et une grande souplesse statutaire, mais des charges sociales plus élevées sur la rémunération. L'EURL, soumise par défaut à l'IR, permet à son gérant associé unique de relever du régime des travailleurs non-salariés (TNS), moins coûteux en charges mais avec une couverture sociale moindre. Le choix dépend du niveau de rémunération souhaité et de la stratégie de distribution de dividendes.",
      tags: "sasu,eurl,forme juridique,statut social",
    },
    {
      id: "00000000-0000-0000-0000-000000000107",
      category: "Juridique",
      title: "Obligations légales d'approbation des comptes annuels",
      content:
        "Les comptes annuels doivent être approuvés par l'assemblée générale ordinaire dans les 6 mois suivant la clôture de l'exercice. Le dépôt au greffe du tribunal de commerce doit intervenir dans le mois suivant l'approbation (2 mois si dépôt électronique). Le défaut de dépôt expose à une injonction du président du tribunal et à une amende pouvant aller jusqu'à 1 500 €.",
      tags: "comptes annuels,ago,dépôt greffe,délai",
    },
    {
      id: "00000000-0000-0000-0000-000000000108",
      category: "Procédures internes",
      title: "Checklist d'onboarding d'un nouveau client",
      content:
        "1) Récupérer KBIS, statuts et pièce d'identité du dirigeant. 2) Créer la fiche client dans TREVYS OS et le dossier GED associé. 3) Recueillir lettre de mission signée et mandat de prélèvement si applicable. 4) Vérifier la conformité LCB-FT (lutte contre le blanchiment). 5) Récupérer les accès comptables existants (logiciel, banque). 6) Planifier le premier point avec le collaborateur référent dans les 15 jours.",
      tags: "onboarding,nouveau client,lcb-ft,lettre de mission",
    },
    {
      id: "00000000-0000-0000-0000-000000000109",
      category: "Procédures internes",
      title: "Procédure de validation des devis et lettres de mission",
      content:
        "Tout devis ou lettre de mission doit être revu par un manager avant envoi au client. Les missions dépassant 10 000 € HT annuels nécessitent une validation par un associé. Le devis signé est archivé dans la GED du client sous la catégorie « Contractuel » et la mission est activée dans le module Production une fois le mandat de prélèvement reçu.",
      tags: "devis,lettre de mission,validation,production",
    },
  ];

  for (const k of knowledgeArticleData) {
    const data = {
      title: k.title,
      category: k.category,
      content: k.content,
      tags: k.tags,
      status: "validee",
      createdBy: partner.id,
      validatedBy: partner.id,
    };
    await prisma.knowledgeArticle.upsert({
      where: { id: k.id },
      update: data,
      create: { id: k.id, ...data },
    });
  }

  const prospectData = [
    {
      id: "00000000-0000-0000-0000-000000000200",
      companyName: "Atelier Dubreuil SARL",
      contactName: "Marc Dubreuil",
      contactEmail: "m.dubreuil@atelier-dubreuil.fr",
      source: "Recommandation",
      estimatedValue: 3600,
      pipelineStage: "prospects",
    },
    {
      id: "00000000-0000-0000-0000-000000000201",
      companyName: "NovaTech Consulting",
      contactName: "Sophie Aubert",
      contactEmail: "sophie.aubert@novatech.fr",
      source: "Site web",
      estimatedValue: 5200,
      pipelineStage: "prospects",
    },
    {
      id: "00000000-0000-0000-0000-000000000202",
      companyName: "Boulangerie Les Blés d'Or",
      contactName: "Hervé Mercier",
      contactEmail: "contact@blesdor.fr",
      source: "Salon professionnel",
      estimatedValue: 1800,
      pipelineStage: "en_attente",
    },
  ];

  for (const p of prospectData) {
    const data = { ...p, assignedToId: manager.id };
    await prisma.prospect.upsert({
      where: { id: p.id },
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
