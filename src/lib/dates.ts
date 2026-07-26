// Dates « heure de Paris ». Le serveur peut tourner en GMT : sans cela, la
// date du jour basculerait à 1 h ou 2 h du matin (planificateur, statistiques,
// dates par défaut) au lieu de minuit heure française.
export function parisToday(): string {
  // fr-CA donne directement le format AAAA-MM-JJ.
  return new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}

export function parisDateOf(d: Date): string {
  return d.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
}
