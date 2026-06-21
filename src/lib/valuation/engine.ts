export type FinancialInputs = {
  chiffreAffaires: number;
  ebitda: number; // EBE
  ebit: number; // résultat d'exploitation
  resultatNet: number;
  netDebt: number; // dette financière nette (manuel)
  capitauxPropres: number; // valeur comptable (manuel, pour l'ANR)
  fiscalYear: number;
};

export type DcfAssumptions = {
  growthRate: number; // taux de croissance annuel des FCF, en %
  wacc: number; // coût moyen pondéré du capital, en %
  terminalGrowthRate: number; // croissance à l'infini, en %
  horizonYears: number; // nombre d'années projetées
  fcfBase: number; // flux de trésorerie disponible de départ (année 0)
};

export type MultipleLine = {
  id: string;
  label: string;
  metric: "ebitda" | "ebit" | "chiffreAffaires" | "resultatNet";
  multiple: number;
};

export type AnrAdjustment = {
  id: string;
  label: string;
  amount: number; // plus(+)/moins(-)-value latente
};

export type AnrAssumptions = {
  capitauxPropres: number;
  adjustments: AnrAdjustment[];
};

export type MethodWeights = {
  dcf: number;
  multiples: number;
  anr: number;
};

export type DcfResult = {
  projectedFcf: number[];
  discountedFcf: number[];
  terminalValue: number;
  discountedTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
};

export function computeDcf(assumptions: DcfAssumptions, netDebt: number): DcfResult {
  const { growthRate, wacc, terminalGrowthRate, horizonYears, fcfBase } = assumptions;
  const g = growthRate / 100;
  const r = wacc / 100;
  const gTerm = terminalGrowthRate / 100;

  const projectedFcf: number[] = [];
  const discountedFcf: number[] = [];
  let fcf = fcfBase;
  for (let t = 1; t <= horizonYears; t++) {
    fcf = fcf * (1 + g);
    projectedFcf.push(fcf);
    discountedFcf.push(fcf / Math.pow(1 + r, t));
  }

  const lastFcf = projectedFcf[projectedFcf.length - 1] ?? fcfBase;
  const terminalValue = r > gTerm ? (lastFcf * (1 + gTerm)) / (r - gTerm) : 0;
  const discountedTerminalValue = terminalValue / Math.pow(1 + r, horizonYears);

  const enterpriseValue = discountedFcf.reduce((a, b) => a + b, 0) + discountedTerminalValue;
  const equityValue = enterpriseValue - netDebt;

  return { projectedFcf, discountedFcf, terminalValue, discountedTerminalValue, enterpriseValue, equityValue };
}

export type MultiplesResult = {
  lines: (MultipleLine & { enterpriseValue: number; equityValue: number })[];
  averageEquityValue: number;
};

export function computeMultiples(
  lines: MultipleLine[],
  financials: FinancialInputs,
  netDebt: number
): MultiplesResult {
  const metricValue = (metric: MultipleLine["metric"]) => {
    switch (metric) {
      case "ebitda":
        return financials.ebitda;
      case "ebit":
        return financials.ebit;
      case "chiffreAffaires":
        return financials.chiffreAffaires;
      case "resultatNet":
        return financials.resultatNet;
    }
  };

  const computed = lines.map((line) => {
    const enterpriseValue = metricValue(line.metric) * line.multiple;
    const equityValue = line.metric === "resultatNet" ? enterpriseValue : enterpriseValue - netDebt;
    return { ...line, enterpriseValue, equityValue };
  });

  const averageEquityValue =
    computed.length > 0 ? computed.reduce((a, l) => a + l.equityValue, 0) / computed.length : 0;

  return { lines: computed, averageEquityValue };
}

export type AnrResult = {
  bookEquity: number;
  totalAdjustments: number;
  equityValue: number;
};

export function computeAnr(assumptions: AnrAssumptions): AnrResult {
  const totalAdjustments = assumptions.adjustments.reduce((a, adj) => a + adj.amount, 0);
  return {
    bookEquity: assumptions.capitauxPropres,
    totalAdjustments,
    equityValue: assumptions.capitauxPropres + totalAdjustments,
  };
}

export type ValuationResults = {
  dcf: DcfResult | null;
  multiples: MultiplesResult | null;
  anr: AnrResult | null;
  weights: MethodWeights;
  weightedEquityValue: number;
  min: number;
  max: number;
  median: number;
};

export function computeValuation(
  financials: FinancialInputs,
  weights: MethodWeights,
  dcfAssumptions: DcfAssumptions | null,
  multipleLines: MultipleLine[] | null,
  anrAssumptions: AnrAssumptions | null
): ValuationResults {
  const dcf = dcfAssumptions ? computeDcf(dcfAssumptions, financials.netDebt) : null;
  const multiples = multipleLines && multipleLines.length > 0 ? computeMultiples(multipleLines, financials, financials.netDebt) : null;
  const anr = anrAssumptions ? computeAnr(anrAssumptions) : null;

  const values: { value: number; weight: number }[] = [];
  if (dcf) values.push({ value: dcf.equityValue, weight: weights.dcf });
  if (multiples) values.push({ value: multiples.averageEquityValue, weight: weights.multiples });
  if (anr) values.push({ value: anr.equityValue, weight: weights.anr });

  const totalWeight = values.reduce((a, v) => a + v.weight, 0) || 1;
  const weightedEquityValue = values.reduce((a, v) => a + (v.value * v.weight) / totalWeight, 0);

  const rawValues = values.map((v) => v.value).filter((v) => Number.isFinite(v));
  const sorted = [...rawValues].sort((a, b) => a - b);
  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const median =
    sorted.length === 0
      ? 0
      : sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  return { dcf, multiples, anr, weights, weightedEquityValue, min, max, median };
}

export type SensitivityGrid = {
  waccValues: number[];
  growthValues: number[];
  matrix: number[][]; // [waccIndex][growthIndex] -> equity value
};

export function computeSensitivity(
  baseAssumptions: DcfAssumptions,
  netDebt: number,
  waccRange: number[],
  growthRange: number[]
): SensitivityGrid {
  const matrix = waccRange.map((wacc) =>
    growthRange.map((terminalGrowthRate) => {
      const result = computeDcf({ ...baseAssumptions, wacc, terminalGrowthRate }, netDebt);
      return result.equityValue;
    })
  );
  return { waccValues: waccRange, growthValues: growthRange, matrix };
}

export type ScenarioKey = "pessimiste" | "realiste" | "optimiste";

export type Scenario = {
  key: ScenarioKey;
  label: string;
  dcfAssumptions: DcfAssumptions;
  multipleLines: MultipleLine[];
  anrAssumptions: AnrAssumptions;
  weights: MethodWeights;
};

export function computeScenarios(financials: FinancialInputs, scenarios: Scenario[]) {
  return scenarios.map((scenario) => ({
    key: scenario.key,
    label: scenario.label,
    results: computeValuation(
      financials,
      scenario.weights,
      scenario.dcfAssumptions,
      scenario.multipleLines,
      scenario.anrAssumptions
    ),
  }));
}
