export type LegalCaseType = "depot_comptes" | "creation_societe" | "formalite";

export const LEGAL_FORMS = ["SARL", "SAS", "SASU", "EURL", "SCI"] as const;

export const DEPOT_COMPTES_STEPS = [
  "Clôture de l'exercice validée",
  "Préparation des comptes annuels",
  "Approbation par l'assemblée générale",
  "Procès-verbal d'assemblée",
  "Dépôt au greffe (Infogreffe / Guichet unique)",
  "Publication BODACC",
  "Confirmation de dépôt reçue",
];

export const CREATION_SOCIETE_STEPS = [
  "Choix de la forme juridique",
  "Rédaction des statuts",
  "Dépôt du capital social",
  "Publication d'annonce légale",
  "Dossier d'immatriculation (Guichet unique)",
  "Réception du Kbis",
  "Ouverture des registres obligatoires",
];

export function stepsForType(type: LegalCaseType): string[] {
  if (type === "depot_comptes") return DEPOT_COMPTES_STEPS;
  if (type === "creation_societe") return CREATION_SOCIETE_STEPS;
  return [];
}

/**
 * AG must approve accounts within 6 months of fiscal year-end; deposit at
 * the greffe is due within 1 month after the AG (2 if filed online).
 * We use the standard 7-month window (6 + 1) as the working deadline.
 */
export function computeDepotComptesDueDate(fiscalYear: number): Date {
  const fiscalYearEnd = new Date(fiscalYear, 11, 31);
  const due = new Date(fiscalYearEnd);
  due.setMonth(due.getMonth() + 7);
  return due;
}

export const TYPE_LABELS: Record<LegalCaseType, string> = {
  depot_comptes: "Dépôt des comptes",
  creation_societe: "Création de société",
  formalite: "Autre formalité",
};
