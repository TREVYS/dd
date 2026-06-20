import { prisma } from "@/lib/prisma";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const PERMANENT_SUBFOLDERS = [
  { name: "Identification de l'entreprise", folderType: "identification" },
  { name: "Social", folderType: "social" },
  { name: "Lettre de mission", folderType: "lettre_mission" },
  { name: "Emprunts", folderType: "emprunts" },
  { name: "Divers", folderType: "divers" },
  { name: "Reprise de dossier", folderType: "reprise" },
];

const DECLARATIONS_SUBFOLDERS = [
  "TVA",
  "IS",
  "CFE",
  "CVAE",
  "DAS2",
  "RCM",
  "TVS",
  "Autres taxes",
];

const CLOTURE_SUBFOLDERS = [
  "Dossier de révision",
  "Cycles",
  "Liasse fiscale",
  "Plaquette",
  "FEC",
  "Annexes",
  "Justificatifs de clôture",
];

async function createFolder(data: {
  clientId: string;
  parentId: string | null;
  name: string;
  folderType: string;
  level: number;
  fiscalYear?: number | null;
  month?: number | null;
}) {
  return prisma.documentFolder.create({
    data: {
      clientId: data.clientId,
      parentId: data.parentId,
      name: data.name,
      folderType: data.folderType,
      level: data.level,
      fiscalYear: data.fiscalYear ?? null,
      month: data.month ?? null,
      isSystemFolder: true,
    },
  });
}

export async function ensurePermanentFolder(clientId: string) {
  const existing = await prisma.documentFolder.findFirst({
    where: { clientId, folderType: "permanent", parentId: null },
  });
  if (existing) return existing;

  const permanent = await createFolder({
    clientId,
    parentId: null,
    name: "Dossier permanent",
    folderType: "permanent",
    level: 1,
  });

  for (const sub of PERMANENT_SUBFOLDERS) {
    await createFolder({
      clientId,
      parentId: permanent.id,
      name: sub.name,
      folderType: sub.folderType,
      level: 2,
    });
  }

  return permanent;
}

export async function ensureFiscalYearFolder(clientId: string, year: number) {
  const existing = await prisma.documentFolder.findFirst({
    where: { clientId, folderType: "exercice", fiscalYear: year, parentId: null },
  });
  if (existing) return existing;

  const exercice = await createFolder({
    clientId,
    parentId: null,
    name: `Exercice comptable ${year}`,
    folderType: "exercice",
    level: 1,
    fiscalYear: year,
  });

  const comptabilite = await createFolder({
    clientId,
    parentId: exercice.id,
    name: "Comptabilité",
    folderType: "comptabilite",
    level: 2,
    fiscalYear: year,
  });
  for (let i = 0; i < MONTHS.length; i++) {
    await createFolder({
      clientId,
      parentId: comptabilite.id,
      name: MONTHS[i],
      folderType: "comptabilite_mois",
      level: 3,
      fiscalYear: year,
      month: i + 1,
    });
  }

  const declarations = await createFolder({
    clientId,
    parentId: exercice.id,
    name: "Déclarations fiscales",
    folderType: "declarations",
    level: 2,
    fiscalYear: year,
  });
  for (const sub of DECLARATIONS_SUBFOLDERS) {
    await createFolder({
      clientId,
      parentId: declarations.id,
      name: sub,
      folderType: "declaration_taxe",
      level: 3,
      fiscalYear: year,
    });
  }

  const cloture = await createFolder({
    clientId,
    parentId: exercice.id,
    name: "Bilan & clôture",
    folderType: "cloture",
    level: 2,
    fiscalYear: year,
  });
  for (const sub of CLOTURE_SUBFOLDERS) {
    await createFolder({
      clientId,
      parentId: cloture.id,
      name: sub,
      folderType: "cloture_element",
      level: 3,
      fiscalYear: year,
    });
  }

  await createFolder({
    clientId,
    parentId: exercice.id,
    name: "Juridique",
    folderType: "juridique",
    level: 2,
    fiscalYear: year,
  });

  await createFolder({
    clientId,
    parentId: exercice.id,
    name: "Autre demande",
    folderType: "autre_demande",
    level: 2,
    fiscalYear: year,
  });

  return exercice;
}

export async function ensureClientFolderTree(clientId: string, year = new Date().getFullYear()) {
  await ensurePermanentFolder(clientId);
  await ensureFiscalYearFolder(clientId, year);
}
