// Correspondance entre les pages françaises et leurs équivalents anglais
// (vraies pages traduites, pas de traduction automatique à la volée).
// Utilisé par le bouton EN/FR de la nav pour amener le visiteur sur la
// bonne page plutôt que systématiquement sur l'accueil.
export const FR_TO_EN: Record<string, string> = {
  "/": "/en",
  "/expertise-comptable": "/en/accounting-expertise",
  "/consulting": "/en/consulting",
  "/intelligence-artificielle": "/en/ai",
  "/facturation-electronique": "/en/e-invoicing",
  "/audit-organisationnel": "/en/organizational-audit",
  "/le-cabinet": "/en/about",
  "/notre-ecosysteme": "/en/ecosystem",
  "/references": "/en/references",
  "/contact": "/en/contact",
  "/blog": "/en/blog",
};

export const EN_TO_FR: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN).map(([fr, en]) => [en, fr]),
);
