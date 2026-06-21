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
