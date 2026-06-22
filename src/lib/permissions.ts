export const MODULES = [
  { key: "crm", label: "CRM" },
  { key: "production", label: "Production" },
  { key: "ged", label: "GED" },
  { key: "juridique", label: "Juridique" },
  { key: "academy", label: "Academy" },
  { key: "assistant_ia", label: "Assistant IA" },
  { key: "knowledge_cabinet", label: "Knowledge Cabinet" },
  { key: "ticketing", label: "Ticketing" },
  { key: "reporting", label: "Reporting" },
] as const;

export const ROLE_NAMES = ["Collaborateur", "Manager", "Associé", "Administrateur"] as const;

export function canManageCollaborators(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur";
}

export function canManageHabilitations(role: string | null | undefined) {
  return role === "Administrateur";
}

export function canManageAcademy(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur";
}

// Seul le super admin (Administrateur) peut créer/éditer les formations du store Academy.
export function canCreateFormations(role: string | null | undefined) {
  return role === "Administrateur";
}

// L'Associé peut acheter (acquérir) une formation du store et la rendre disponible à ses équipes.
export function canPurchaseFormations(role: string | null | undefined) {
  return role === "Associé";
}

export function canManageEmailSettings(role: string | null | undefined) {
  return role === "Administrateur";
}

export function canManageFecAnalysis(role: string | null | undefined) {
  return (
    role === "Associé" ||
    role === "Administrateur" ||
    role === "Manager" ||
    role === "Collaborateur"
  );
}

export function canManageValuations(role: string | null | undefined) {
  return (
    role === "Associé" ||
    role === "Administrateur" ||
    role === "Manager" ||
    role === "Collaborateur"
  );
}

// Le "supérieur" (Associé/Administrateur) valide ou rejette une valorisation soumise.
export function canValidateValuations(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur";
}

export function canManageValuationBranding(role: string | null | undefined) {
  return role === "Administrateur";
}

export function canManageRevision(role: string | null | undefined) {
  return (
    role === "Associé" ||
    role === "Administrateur" ||
    role === "Manager" ||
    role === "Collaborateur"
  );
}

export function canValidateRevisionManager(role: string | null | undefined) {
  return role === "Manager" || role === "Associé" || role === "Administrateur";
}

export function canValidateRevisionPartner(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur";
}

export function canConfigureRevisionTemplates(role: string | null | undefined) {
  return role === "Administrateur";
}

export function canManageTaskPilotage(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur" || role === "Manager";
}

export function canValidateTasks(role: string | null | undefined) {
  return role === "Associé" || role === "Administrateur" || role === "Manager";
}
