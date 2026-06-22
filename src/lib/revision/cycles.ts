export type DossierFlags = {
  hasEmployees: boolean;
  hasStocks: boolean;
  hasLoans: boolean;
  hasFixedAssets: boolean;
  hasCurrentAccounts: boolean;
  hasTaxGroup: boolean;
  clientTypology?: string | null;
};

export type CycleDefinition = {
  code: string;
  label: string;
  orderIndex: number;
  accountPrefixes: string[];
  objectives: string;
  isApplicable: (flags: DossierFlags) => boolean;
};

export const CYCLE_DEFINITIONS: CycleDefinition[] = [
  {
    code: "immobilisations",
    label: "Immobilisations",
    orderIndex: 1,
    accountPrefixes: ["20", "21", "27", "28", "68", "775", "675"],
    objectives: "Vérifier l'existence, la valorisation et les amortissements des immobilisations.",
    isApplicable: (f) => f.hasFixedAssets,
  },
  {
    code: "stocks",
    label: "Stocks",
    orderIndex: 2,
    accountPrefixes: ["3", "603", "713"],
    objectives: "Contrôler l'existence et la valorisation des stocks et la variation de stocks.",
    isApplicable: (f) => f.hasStocks,
  },
  {
    code: "clients_ventes",
    label: "Clients / Ventes",
    orderIndex: 3,
    accountPrefixes: ["411", "70", "418", "491"],
    objectives: "S'assurer du correct enregistrement des ventes, du recouvrement client et des provisions.",
    isApplicable: () => true,
  },
  {
    code: "fournisseurs_achats",
    label: "Fournisseurs / Achats",
    orderIndex: 4,
    accountPrefixes: ["401", "60", "61", "62", "408", "409"],
    objectives: "Vérifier l'exhaustivité des achats et le correct rattachement des charges.",
    isApplicable: () => true,
  },
  {
    code: "tresorerie",
    label: "Trésorerie",
    orderIndex: 5,
    accountPrefixes: ["51", "53", "54"],
    objectives: "Rapprocher les soldes bancaires et caisse, vérifier les rapprochements bancaires.",
    isApplicable: () => true,
  },
  {
    code: "capitaux_propres",
    label: "Capitaux propres",
    orderIndex: 6,
    accountPrefixes: ["10", "11", "12", "13"],
    objectives: "Contrôler la composition et les mouvements des capitaux propres.",
    isApplicable: () => true,
  },
  {
    code: "provisions",
    label: "Provisions pour risques et charges",
    orderIndex: 7,
    accountPrefixes: ["15", "681", "781"],
    objectives: "Vérifier le bien-fondé et l'évaluation des provisions pour risques et charges.",
    isApplicable: () => true,
  },
  {
    code: "emprunts",
    label: "Emprunts",
    orderIndex: 8,
    accountPrefixes: ["16", "661", "168"],
    objectives: "Contrôler les emprunts, leurs échéances et les charges financières associées.",
    isApplicable: (f) => f.hasLoans,
  },
  {
    code: "titres_comptes_courants",
    label: "Titres et comptes courants",
    orderIndex: 9,
    accountPrefixes: ["26", "27", "455", "586", "765"],
    objectives:
      "Vérifier les titres de participation, les comptes courants d'associés et les produits financiers liés.",
    isApplicable: (f) => f.hasCurrentAccounts || f.clientTypology === "holding",
  },
  {
    code: "personnel_social",
    label: "Personnel / Social",
    orderIndex: 10,
    accountPrefixes: ["42", "43", "64"],
    objectives: "Contrôler les charges de personnel, les dettes sociales et la cohérence avec la DSN.",
    isApplicable: (f) => f.hasEmployees,
  },
  {
    code: "etat_fiscalite",
    label: "État / Fiscalité",
    orderIndex: 11,
    accountPrefixes: ["44"],
    objectives: "Vérifier les dettes et créances fiscales hors TVA et IS.",
    isApplicable: () => true,
  },
  {
    code: "tva",
    label: "TVA",
    orderIndex: 12,
    accountPrefixes: ["445"],
    objectives: "Contrôler la cohérence de la TVA collectée/déductible avec les déclarations.",
    isApplicable: () => true,
  },
  {
    code: "is_resultat_fiscal",
    label: "IS / Résultat fiscal",
    orderIndex: 13,
    accountPrefixes: ["695", "699", "44951"],
    objectives: "Vérifier le calcul de l'IS et la cohérence du résultat fiscal.",
    isApplicable: (f) => !f.hasTaxGroup,
  },
  {
    code: "cutoff_achats",
    label: "Cut-off achats",
    orderIndex: 14,
    accountPrefixes: ["408", "60", "61", "62"],
    objectives: "Vérifier le bon rattachement des achats à l'exercice (factures non parvenues).",
    isApplicable: () => true,
  },
  {
    code: "cutoff_ventes",
    label: "Cut-off ventes",
    orderIndex: 15,
    accountPrefixes: ["418", "70"],
    objectives: "Vérifier le bon rattachement des ventes à l'exercice (factures à établir).",
    isApplicable: () => true,
  },
  {
    code: "charges_constatees_avance",
    label: "Charges constatées d'avance",
    orderIndex: 16,
    accountPrefixes: ["486"],
    objectives: "Contrôler la pertinence des charges constatées d'avance.",
    isApplicable: () => true,
  },
  {
    code: "produits_constates_avance",
    label: "Produits constatés d'avance",
    orderIndex: 17,
    accountPrefixes: ["487"],
    objectives: "Contrôler la pertinence des produits constatés d'avance.",
    isApplicable: () => true,
  },
  {
    code: "notes_de_frais",
    label: "Notes de frais",
    orderIndex: 18,
    accountPrefixes: ["625", "421"],
    objectives: "Vérifier la justification et la conformité des notes de frais.",
    isApplicable: () => true,
  },
  {
    code: "comptes_attente",
    label: "Comptes d'attente",
    orderIndex: 19,
    accountPrefixes: ["471", "472", "467", "580"],
    objectives: "S'assurer que les comptes d'attente sont soldés ou justifiés en fin d'exercice.",
    isApplicable: () => true,
  },
  {
    code: "resultat_coherence_globale",
    label: "Résultat et cohérence globale",
    orderIndex: 20,
    accountPrefixes: ["12", "6", "7"],
    objectives: "Analyser la cohérence globale du résultat et la revue analytique N/N-1.",
    isApplicable: () => true,
  },
];

export function buildCyclesForDossier(flags: DossierFlags) {
  return CYCLE_DEFINITIONS.map((def) => ({
    code: def.code,
    label: def.label,
    orderIndex: def.orderIndex,
    accountPrefixes: def.accountPrefixes,
    objectives: def.objectives,
    isApplicable: def.isApplicable(flags),
    status: def.isApplicable(flags) ? "non_commence" : "non_applicable",
  }));
}
