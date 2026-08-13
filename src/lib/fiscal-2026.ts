// Paramètres fiscaux et sociaux 2026 — source unique du simulateur.
// Chaque valeur est sourcée ; à réviser chaque année (janvier).
//
// Sources officielles :
// - PASS 2026 : arrêté du 22 décembre 2025 (Légifrance JORFTEXT000053143451),
//   repris par l'Urssaf (« Plafonds de la Sécurité sociale »).
// - Barème de l'impôt sur les revenus 2025 (imposition 2026) : loi n° 2026-103
//   du 19 février 2026 de finances pour 2026, art. 4 — indexation +0,9 %
//   (BOFiP ACTU-2026-00022).
// - PFU 2026 : 12,8 % d'impôt + 18,6 % de prélèvements sociaux = 31,4 %
//   (impots.gouv.fr, « Les revenus mobiliers » et brochure IR 2026).
// - Impôt sur les sociétés : taux réduit de 15 % jusqu'à 42 500 € de bénéfice
//   pour les PME éligibles, 25 % au-delà (CGI, art. 219).
// - Assiette sociale des indépendants 2026 : abattement de 26 % sur le revenu
//   professionnel pour la CSG/CRDS (réforme applicable en 2026, Urssaf).

export const ANNEE = 2026;
export const MAJ = "2026-08-13"; // dernière vérification des paramètres

export const PASS = 48_060; // plafond annuel de la Sécurité sociale 2026
export const PASS_MENSUEL = 4_005;

// Barème progressif de l'impôt sur le revenu (revenus 2025, imposition 2026).
export const BAREME_IR: { plafond: number; taux: number }[] = [
  { plafond: 11_600, taux: 0 },
  { plafond: 29_579, taux: 0.11 },
  { plafond: 84_577, taux: 0.30 },
  { plafond: 181_917, taux: 0.41 },
  { plafond: Infinity, taux: 0.45 },
];

export const ABATTEMENT_SALARIAL = 0.10; // déduction forfaitaire de 10 %
export const ABATTEMENT_SALARIAL_MAX = 14_426; // plafond de la déduction 10 %
export const ABATTEMENT_DIVIDENDES = 0.40; // abattement si option barème

export const PFU_IR = 0.128;
export const PFU_PS = 0.186;
export const PFU_TOTAL = PFU_IR + PFU_PS; // 31,4 %

export const IS_TAUX_REDUIT = 0.15;
export const IS_SEUIL_TAUX_REDUIT = 42_500;
export const IS_TAUX_NORMAL = 0.25;

// Taux de charges sociales — ordres de grandeur retenus pour l'estimation.
// Les taux réels varient selon l'activité, la caisse et les régimes
// complémentaires : le simulateur donne une fourchette, pas un bulletin de paie.
export const TNS_TAUX_MOYEN = 0.45; // cotisations TNS ≈ 45 % du revenu net
export const AS_TAUX_PATRONAL = 0.54; // charges patronales ≈ 54 % du brut
export const AS_TAUX_SALARIAL = 0.22; // charges salariales ≈ 22 % du brut

// Dividendes des gérants majoritaires : la fraction supérieure à 10 % du
// capital social (primes d'émission et comptes courants inclus) est soumise
// aux cotisations sociales TNS au lieu des prélèvements sociaux.
export const SEUIL_DIVIDENDES_TNS = 0.10;

// --- Calculs ---------------------------------------------------------------

// Impôt sur le revenu au barème progressif, avec quotient familial.
export function impotRevenu(revenuImposable: number, parts = 1): number {
  if (revenuImposable <= 0) return 0;
  const parPart = revenuImposable / parts;
  let impot = 0;
  let bas = 0;
  for (const t of BAREME_IR) {
    if (parPart > bas) {
      impot += (Math.min(parPart, t.plafond) - bas) * t.taux;
      bas = t.plafond;
    } else break;
  }
  return Math.max(0, Math.round(impot * parts));
}

// Impôt sur les sociétés (taux réduit PME puis taux normal).
export function impotSocietes(benefice: number): number {
  if (benefice <= 0) return 0;
  const reduit = Math.min(benefice, IS_SEUIL_TAUX_REDUIT) * IS_TAUX_REDUIT;
  const normal = Math.max(0, benefice - IS_SEUIL_TAUX_REDUIT) * IS_TAUX_NORMAL;
  return Math.round(reduit + normal);
}

export type Statut = "tns" | "assimile";

export type SimulationEntree = {
  disponible: number; // résultat avant rémunération et charges du dirigeant
  statut: Statut;
  partRemuneration: number; // 0 à 1 : part du disponible affectée à la rémunération
  parts: number; // parts de quotient familial
  capitalSocial: number; // pour le seuil des 10 % (statut TNS)
};

export type SimulationResultat = {
  remunerationNette: number; // net avant impôt sur le revenu
  chargesSociales: number;
  beneficeAvantIs: number;
  is: number;
  dividendesBruts: number;
  cotisationsDividendes: number; // TNS : part au-delà de 10 % du capital
  prelevementsDividendes: number; // PFU (impôt + prélèvements sociaux)
  irSurRemuneration: number;
  netEnPoche: number;
  tauxPrelevementGlobal: number; // en %
};

// Simulation d'une répartition rémunération / dividendes.
// Hypothèses simplificatrices assumées et affichées à l'utilisateur :
// aucun autre revenu du foyer, pas de crédit ni de réduction d'impôt,
// dividendes soumis au PFU, taux de charges moyens.
export function simuler(e: SimulationEntree): SimulationResultat {
  const disponible = Math.max(0, e.disponible);
  const part = Math.min(1, Math.max(0, e.partRemuneration));
  const enveloppeRemuneration = disponible * part;

  let remunerationNette: number;
  let chargesSociales: number;

  if (e.statut === "tns") {
    // L'enveloppe couvre le revenu net + les cotisations assises dessus.
    remunerationNette = enveloppeRemuneration / (1 + TNS_TAUX_MOYEN);
    chargesSociales = enveloppeRemuneration - remunerationNette;
  } else {
    // L'enveloppe couvre le brut + les charges patronales ; le net est le
    // brut diminué des charges salariales.
    const brut = enveloppeRemuneration / (1 + AS_TAUX_PATRONAL);
    chargesSociales = enveloppeRemuneration - brut * (1 - AS_TAUX_SALARIAL);
    remunerationNette = brut * (1 - AS_TAUX_SALARIAL);
  }
  remunerationNette = Math.round(remunerationNette);
  chargesSociales = Math.round(chargesSociales);

  // Résultat imposable à l'IS : ce qui n'a pas été distribué en rémunération.
  const beneficeAvantIs = Math.round(disponible - enveloppeRemuneration);
  const is = impotSocietes(beneficeAvantIs);
  const dividendesBruts = Math.max(0, beneficeAvantIs - is);

  // Gérant majoritaire : la fraction des dividendes supérieure à 10 % du
  // capital social supporte les cotisations TNS.
  let cotisationsDividendes = 0;
  let assiettePfu = dividendesBruts;
  if (e.statut === "tns" && dividendesBruts > 0) {
    const seuil = Math.max(0, e.capitalSocial) * SEUIL_DIVIDENDES_TNS;
    const partCotisee = Math.max(0, dividendesBruts - seuil);
    cotisationsDividendes = Math.round(partCotisee * TNS_TAUX_MOYEN);
    assiettePfu = dividendesBruts - cotisationsDividendes;
  }
  const prelevementsDividendes = Math.round(assiettePfu * PFU_TOTAL);

  // Impôt sur le revenu : la rémunération nette après déduction de 10 %.
  const abattement = Math.min(remunerationNette * ABATTEMENT_SALARIAL, ABATTEMENT_SALARIAL_MAX);
  const irSurRemuneration = impotRevenu(Math.max(0, remunerationNette - abattement), e.parts);

  const netEnPoche = Math.round(
    remunerationNette - irSurRemuneration + assiettePfu - prelevementsDividendes,
  );
  const totalPreleve = disponible - netEnPoche;

  return {
    remunerationNette,
    chargesSociales,
    beneficeAvantIs,
    is,
    dividendesBruts,
    cotisationsDividendes,
    prelevementsDividendes,
    irSurRemuneration,
    netEnPoche,
    tauxPrelevementGlobal: disponible > 0 ? Math.round((totalPreleve / disponible) * 1000) / 10 : 0,
  };
}

// Recherche de la répartition qui maximise le net en poche (pas à pas de 5 %).
export function meilleureRepartition(e: Omit<SimulationEntree, "partRemuneration">): {
  part: number;
  resultat: SimulationResultat;
} {
  let best = { part: 0, resultat: simuler({ ...e, partRemuneration: 0 }) };
  for (let p = 5; p <= 100; p += 5) {
    const r = simuler({ ...e, partRemuneration: p / 100 });
    if (r.netEnPoche > best.resultat.netEnPoche) best = { part: p / 100, resultat: r };
  }
  return best;
}
