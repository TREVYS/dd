import { FecLine, fecDateToISO } from "./parser";

export type Anomaly = {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  accountCode?: string;
  journalCode?: string;
};

export type MonthlyPoint = { month: string; value: number };

export type FecMetrics = {
  fiscalYear: number;
  lineCount: number;
  journalCount: number;
  journals: string[];
  totals: {
    chiffreAffaires: number;
    achats: number;
    chargesExternes: number;
    chargesPersonnel: number;
    impotsTaxes: number;
    chargesFinancieres: number;
    produitsFinanciers: number;
    chargesExceptionnelles: number;
    produitsExceptionnels: number;
    dotations: number;
    reprises: number;
    valeurAjoutee: number;
    ebe: number;
    resultatExploitation: number;
    rcai: number;
    resultatNet: number;
  };
  ratios: {
    tauxValeurAjoutee: number | null;
    tauxEbe: number | null;
    tauxResultatNet: number | null;
  };
  monthlyCA: MonthlyPoint[];
  monthlyCharges: MonthlyPoint[];
  monthlyResultat: MonthlyPoint[];
  topClients: { compte: string; libelle: string; montant: number }[];
  topFournisseurs: { compte: string; libelle: string; montant: number }[];
  comptesCourantsAssocies: { compte: string; libelle: string; solde: number }[];
  comptesAttente: { compte: string; libelle: string; solde: number }[];
};

function accountClass(compteNum: string): string {
  return compteNum?.charAt(0) ?? "";
}

function sumByPrefix(lines: FecLine[], prefixes: string[], side: "debit" | "credit" | "net") {
  let total = 0;
  for (const line of lines) {
    if (prefixes.some((p) => line.compteNum.startsWith(p))) {
      if (side === "debit") total += line.debit;
      else if (side === "credit") total += line.credit;
      else total += line.credit - line.debit;
    }
  }
  return total;
}

export function detectAnomalies(lines: FecLine[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  let totalDebit = 0;
  let totalCredit = 0;
  const ecritureBalance = new Map<string, { debit: number; credit: number; journal: string }>();
  const journalLineCount = new Map<string, number>();
  const accountsSeen = new Set<string>();
  let missingLibelle = 0;
  let invalidDates = 0;
  const weekendEntries: FecLine[] = [];

  for (const line of lines) {
    totalDebit += line.debit;
    totalCredit += line.credit;
    accountsSeen.add(line.compteNum);
    journalLineCount.set(line.journalCode, (journalLineCount.get(line.journalCode) ?? 0) + 1);

    const key = `${line.journalCode}-${line.ecritureNum}`;
    const entry = ecritureBalance.get(key) ?? { debit: 0, credit: 0, journal: line.journalCode };
    entry.debit += line.debit;
    entry.credit += line.credit;
    ecritureBalance.set(key, entry);

    if (!line.ecritureLib || line.ecritureLib.trim().length === 0) missingLibelle++;

    const iso = fecDateToISO(line.ecritureDate);
    if (!iso) {
      invalidDates++;
    } else {
      const day = new Date(iso).getDay();
      if (day === 0 || day === 6) weekendEntries.push(line);
    }
  }

  if (Math.abs(totalDebit - totalCredit) > 0.5) {
    anomalies.push({
      type: "desequilibre_global",
      severity: "critical",
      message: `Le FEC est déséquilibré : total débit ${totalDebit.toFixed(2)} € vs total crédit ${totalCredit.toFixed(2)} € (écart de ${Math.abs(totalDebit - totalCredit).toFixed(2)} €).`,
    });
  }

  let unbalancedEcritures = 0;
  for (const [key, entry] of ecritureBalance) {
    if (Math.abs(entry.debit - entry.credit) > 0.5) {
      unbalancedEcritures++;
      if (unbalancedEcritures <= 10) {
        anomalies.push({
          type: "ecriture_desequilibree",
          severity: "warning",
          message: `Écriture ${key} déséquilibrée (débit ${entry.debit.toFixed(2)} € / crédit ${entry.credit.toFixed(2)} €).`,
          journalCode: entry.journal,
        });
      }
    }
  }
  if (unbalancedEcritures > 10) {
    anomalies.push({
      type: "ecritures_desequilibrees_resume",
      severity: "warning",
      message: `${unbalancedEcritures} écritures déséquilibrées détectées au total (10 premières listées séparément).`,
    });
  }

  if (missingLibelle > 0) {
    anomalies.push({
      type: "libelle_manquant",
      severity: "info",
      message: `${missingLibelle} ligne(s) sans libellé d'écriture.`,
    });
  }

  if (invalidDates > 0) {
    anomalies.push({
      type: "date_incoherente",
      severity: "warning",
      message: `${invalidDates} ligne(s) avec une date d'écriture incohérente ou illisible.`,
    });
  }

  if (weekendEntries.length > 0) {
    anomalies.push({
      type: "ecriture_weekend",
      severity: "info",
      message: `${weekendEntries.length} écriture(s) enregistrée(s) un samedi ou dimanche, à vérifier.`,
    });
  }

  const attenteAccounts = lines.filter((l) => l.compteNum.startsWith("471"));
  if (attenteAccounts.length > 0) {
    const solde = sumByPrefix(lines, ["471"], "net");
    anomalies.push({
      type: "compte_attente",
      severity: "warning",
      message: `Le compte d'attente 471 présente un solde de ${solde.toFixed(2)} € à analyser.`,
      accountCode: "471",
    });
  }

  const ccaAccounts = lines.filter((l) => l.compteNum.startsWith("455"));
  if (ccaAccounts.length > 0) {
    const solde = sumByPrefix(lines, ["455"], "net");
    anomalies.push({
      type: "compte_courant_associe",
      severity: solde < 0 ? "info" : "warning",
      message:
        solde >= 0
          ? `Le compte courant d'associé (455) est créditeur de ${solde.toFixed(2)} € : possibilité de remboursement à étudier.`
          : `Le compte courant d'associé (455) est débiteur de ${Math.abs(solde).toFixed(2)} €.`,
      accountCode: "455",
    });
  }

  for (const [journal, count] of journalLineCount) {
    if (count > lines.length * 0.5 && journalLineCount.size > 1) {
      anomalies.push({
        type: "volumetrie_journal",
        severity: "info",
        message: `Le journal ${journal} concentre ${count} lignes sur ${lines.length} (${Math.round((count / lines.length) * 100)} %).`,
        journalCode: journal,
      });
    }
  }

  return anomalies;
}

function monthlyAggregate(lines: FecLine[], prefixes: string[], side: "debit" | "credit" | "net"): MonthlyPoint[] {
  const byMonth = new Map<string, number>();
  for (const line of lines) {
    if (!prefixes.some((p) => line.compteNum.startsWith(p))) continue;
    const iso = fecDateToISO(line.ecritureDate);
    if (!iso) continue;
    const month = iso.slice(0, 7);
    const value = side === "debit" ? line.debit : side === "credit" ? line.credit : line.credit - line.debit;
    byMonth.set(month, (byMonth.get(month) ?? 0) + value);
  }
  return Array.from(byMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({ month, value: Math.round(value * 100) / 100 }));
}

function topAuxiliary(lines: FecLine[], prefixes: string[], side: "debit" | "credit") {
  const byAccount = new Map<string, { libelle: string; montant: number }>();
  for (const line of lines) {
    if (!prefixes.some((p) => line.compteNum.startsWith(p))) continue;
    const key = line.compAuxNum || line.compteNum;
    const libelle = line.compAuxLib || line.compteLib;
    const value = side === "debit" ? line.debit : line.credit;
    const current = byAccount.get(key) ?? { libelle, montant: 0 };
    current.montant += value;
    byAccount.set(key, current);
  }
  return Array.from(byAccount.entries())
    .map(([compte, v]) => ({ compte, libelle: v.libelle, montant: Math.round(v.montant * 100) / 100 }))
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 10);
}

export function computeMetrics(lines: FecLine[], fiscalYear: number): FecMetrics {
  const journals = Array.from(new Set(lines.map((l) => l.journalCode))).filter(Boolean);

  const chiffreAffaires = sumByPrefix(lines, ["70"], "net");
  const achats = sumByPrefix(lines, ["60"], "net") * -1;
  const chargesExternes = sumByPrefix(lines, ["61", "62"], "net") * -1;
  const chargesPersonnel = sumByPrefix(lines, ["64"], "net") * -1;
  const impotsTaxes = sumByPrefix(lines, ["63"], "net") * -1;
  const chargesFinancieres = sumByPrefix(lines, ["66"], "net") * -1;
  const produitsFinanciers = sumByPrefix(lines, ["76"], "net");
  const chargesExceptionnelles = sumByPrefix(lines, ["67"], "net") * -1;
  const produitsExceptionnels = sumByPrefix(lines, ["77"], "net");
  const dotations = sumByPrefix(lines, ["68"], "net") * -1;
  const reprises = sumByPrefix(lines, ["78"], "net");

  const production = sumByPrefix(lines, ["70", "71", "72"], "net");
  const consommationsExternes = (sumByPrefix(lines, ["60"], "net") + sumByPrefix(lines, ["61", "62"], "net")) * -1;
  const valeurAjoutee = production - consommationsExternes;
  const ebe = valeurAjoutee - impotsTaxes - chargesPersonnel;
  const resultatExploitation = ebe + reprises - dotations;
  const resultatFinancier = produitsFinanciers - chargesFinancieres;
  const rcai = resultatExploitation + resultatFinancier;
  const resultatExceptionnel = produitsExceptionnels - chargesExceptionnelles;
  const is = sumByPrefix(lines, ["695"], "net") * -1;
  const resultatNet = rcai + resultatExceptionnel - is;

  return {
    fiscalYear,
    lineCount: lines.length,
    journalCount: journals.length,
    journals,
    totals: {
      chiffreAffaires: round2(chiffreAffaires),
      achats: round2(achats),
      chargesExternes: round2(chargesExternes),
      chargesPersonnel: round2(chargesPersonnel),
      impotsTaxes: round2(impotsTaxes),
      chargesFinancieres: round2(chargesFinancieres),
      produitsFinanciers: round2(produitsFinanciers),
      chargesExceptionnelles: round2(chargesExceptionnelles),
      produitsExceptionnels: round2(produitsExceptionnels),
      dotations: round2(dotations),
      reprises: round2(reprises),
      valeurAjoutee: round2(valeurAjoutee),
      ebe: round2(ebe),
      resultatExploitation: round2(resultatExploitation),
      rcai: round2(rcai),
      resultatNet: round2(resultatNet),
    },
    ratios: {
      tauxValeurAjoutee: chiffreAffaires ? round2((valeurAjoutee / chiffreAffaires) * 100) : null,
      tauxEbe: chiffreAffaires ? round2((ebe / chiffreAffaires) * 100) : null,
      tauxResultatNet: chiffreAffaires ? round2((resultatNet / chiffreAffaires) * 100) : null,
    },
    monthlyCA: monthlyAggregate(lines, ["70"], "net"),
    monthlyCharges: monthlyAggregate(lines, ["60", "61", "62", "64"], "net").map((p) => ({ month: p.month, value: Math.abs(p.value) })),
    monthlyResultat: monthlyAggregate(lines, ["6", "7"], "net"),
    topClients: topAuxiliary(lines, ["411"], "debit"),
    topFournisseurs: topAuxiliary(lines, ["401"], "credit"),
    comptesCourantsAssocies: groupedSolde(lines, ["455"]),
    comptesAttente: groupedSolde(lines, ["471", "472", "467"]),
  };
}

function groupedSolde(lines: FecLine[], prefixes: string[]) {
  const byAccount = new Map<string, { libelle: string; solde: number }>();
  for (const line of lines) {
    if (!prefixes.some((p) => line.compteNum.startsWith(p))) continue;
    const current = byAccount.get(line.compteNum) ?? { libelle: line.compteLib, solde: 0 };
    current.solde += line.credit - line.debit;
    byAccount.set(line.compteNum, current);
  }
  return Array.from(byAccount.entries()).map(([compte, v]) => ({
    compte,
    libelle: v.libelle,
    solde: round2(v.solde),
  }));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
