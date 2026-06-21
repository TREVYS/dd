"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, Plus, Trash2, FileDown, Loader2 } from "lucide-react";
import {
  computeValuation,
  type FinancialInputs,
  type MethodWeights,
  type DcfAssumptions,
  type MultipleLine,
  type AnrAdjustment,
  type AnrAssumptions,
  type ValuationResults,
} from "@/lib/valuation/engine";
import type { MethodRecommendation, ValuationNarrative } from "@/lib/valuation/analyst";

type Step = "donnees" | "analyse" | "methodes" | "ajustements" | "restitution" | "rapport";

const STEPS: { key: Step; label: string }[] = [
  { key: "donnees", label: "Données" },
  { key: "analyse", label: "Analyse" },
  { key: "methodes", label: "Méthodes" },
  { key: "ajustements", label: "Ajustements" },
  { key: "restitution", label: "Restitution" },
  { key: "rapport", label: "Rapport" },
];

type FecImportOption = { id: string; fiscalYear: number; fileName: string; metrics: { totals: Record<string, number> } | null };

type ValuationDetail = {
  id: string;
  title: string;
  client: { id: string; legalName: string };
  fecImport: { id: string; fiscalYear: number; metrics: { totals: Record<string, number> } | null } | null;
  versions: {
    id: string;
    label: string;
    inputs: FinancialInputs;
    methodWeights: MethodWeights;
    assumptions: { dcfAssumptions: DcfAssumptions | null; multipleLines: MultipleLine[] | null; anrAssumptions: AnrAssumptions | null };
    results: ValuationResults;
    aiRecommendation: MethodRecommendation | null;
    aiNarrative: ValuationNarrative | null;
    createdAt: string;
  }[];
};

const EMPTY_INPUTS: FinancialInputs = {
  chiffreAffaires: 0,
  ebitda: 0,
  ebit: 0,
  resultatNet: 0,
  netDebt: 0,
  capitauxPropres: 0,
  fiscalYear: new Date().getFullYear() - 1,
};

const EMPTY_DCF: DcfAssumptions = {
  growthRate: 3,
  wacc: 10,
  terminalGrowthRate: 1.5,
  horizonYears: 5,
  fcfBase: 0,
};

const fmtEUR = (n: number | null | undefined) =>
  n === null || n === undefined || !Number.isFinite(n) ? "—" : `${Math.round(n).toLocaleString("fr-FR")} €`;

export function ValuationWizard({ valuationId }: { valuationId: string }) {
  const [valuation, setValuation] = useState<ValuationDetail | null>(null);
  const [fecImports, setFecImports] = useState<FecImportOption[]>([]);
  const [step, setStep] = useState<Step>("donnees");

  const [inputs, setInputs] = useState<FinancialInputs>(EMPTY_INPUTS);
  const [weights, setWeights] = useState<MethodWeights>({ dcf: 0.5, multiples: 0.4, anr: 0.1 });
  const [dcfAssumptions, setDcfAssumptions] = useState<DcfAssumptions>(EMPTY_DCF);
  const [multipleLines, setMultipleLines] = useState<MultipleLine[]>([
    { id: "ebitda", label: "Multiple EBITDA", metric: "ebitda", multiple: 5 },
  ]);
  const [anrAdjustments, setAnrAdjustments] = useState<AnrAdjustment[]>([]);

  const [recommendation, setRecommendation] = useState<MethodRecommendation | null>(null);
  const [narrative, setNarrative] = useState<ValuationNarrative | null>(null);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [loadingNarrative, setLoadingNarrative] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  async function load() {
    const v: ValuationDetail = await fetch(`/api/valuations/${valuationId}`).then((r) => r.json());
    setValuation(v);
    const imports = await fetch(`/api/fec/imports?clientId=${v.client.id}`).then((r) => r.json());
    setFecImports(imports);

    const latest = v.versions[0];
    if (latest) {
      setInputs(latest.inputs);
      setWeights(latest.methodWeights);
      if (latest.assumptions.dcfAssumptions) setDcfAssumptions(latest.assumptions.dcfAssumptions);
      if (latest.assumptions.multipleLines) setMultipleLines(latest.assumptions.multipleLines);
      if (latest.assumptions.anrAssumptions) setAnrAdjustments(latest.assumptions.anrAssumptions.adjustments);
      setRecommendation(latest.aiRecommendation ?? null);
      setNarrative(latest.aiNarrative ?? null);
    } else if (v.fecImport?.metrics?.totals) {
      const t = v.fecImport.metrics.totals;
      setInputs({
        chiffreAffaires: t.chiffreAffaires ?? 0,
        ebitda: t.ebe ?? 0,
        ebit: t.resultatExploitation ?? 0,
        resultatNet: t.resultatNet ?? 0,
        netDebt: 0,
        capitauxPropres: 0,
        fiscalYear: v.fecImport.fiscalYear,
      });
      setDcfAssumptions((d) => ({ ...d, fcfBase: t.ebe ?? 0 }));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuationId]);

  function applyFecImport(importId: string) {
    const imp = fecImports.find((f) => f.id === importId);
    if (!imp?.metrics?.totals) return;
    const t = imp.metrics.totals;
    setInputs({
      chiffreAffaires: t.chiffreAffaires ?? 0,
      ebitda: t.ebe ?? 0,
      ebit: t.resultatExploitation ?? 0,
      resultatNet: t.resultatNet ?? 0,
      netDebt: inputs.netDebt,
      capitauxPropres: inputs.capitauxPropres,
      fiscalYear: imp.fiscalYear,
    });
    setDcfAssumptions((d) => ({ ...d, fcfBase: t.ebe ?? 0 }));
  }

  const anrAssumptions: AnrAssumptions = useMemo(
    () => ({ capitauxPropres: inputs.capitauxPropres, adjustments: anrAdjustments }),
    [inputs.capitauxPropres, anrAdjustments]
  );

  const results = useMemo(
    () => computeValuation(inputs, weights, dcfAssumptions, multipleLines, anrAssumptions),
    [inputs, weights, dcfAssumptions, multipleLines, anrAssumptions]
  );

  async function handleRecommend() {
    setLoadingRecommend(true);
    const rec: MethodRecommendation = await fetch(`/api/valuations/${valuationId}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs }),
    }).then((r) => r.json());
    setRecommendation(rec);
    setWeights(rec.weights);
    setLoadingRecommend(false);
  }

  async function handleNarrative() {
    setLoadingNarrative(true);
    const n: ValuationNarrative = await fetch(`/api/valuations/${valuationId}/narrative`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs, results }),
    }).then((r) => r.json());
    setNarrative(n);
    setLoadingNarrative(false);
  }

  async function handleSaveVersion() {
    setSaving(true);
    setSaveFeedback(null);
    const res = await fetch(`/api/valuations/${valuationId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: `Version du ${new Date().toLocaleDateString("fr-FR")}`,
        inputs,
        methodWeights: weights,
        dcfAssumptions,
        multipleLines,
        anrAssumptions,
        scenarios: [],
        aiRecommendation: recommendation,
        aiNarrative: narrative,
      }),
    });
    setSaving(false);
    setSaveFeedback(res.ok ? "Version enregistrée." : "Erreur lors de l'enregistrement.");
    if (res.ok) load();
  }

  async function handleGenerateReport() {
    setLoadingReport(true);
    if (!narrative) await handleNarrative();
    await handleSaveVersion();
    const res = await fetch(`/api/valuations/${valuationId}/report`, { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valorisation-${valuation?.client.legalName ?? "rapport"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoadingReport(false);
  }

  function addMultipleLine() {
    setMultipleLines((lines) => [
      ...lines,
      { id: crypto.randomUUID(), label: "Nouveau multiple", metric: "ebitda", multiple: 5 },
    ]);
  }

  function addAnrAdjustment() {
    setAnrAdjustments((a) => [...a, { id: crypto.randomUUID(), label: "Ajustement", amount: 0 }]);
  }

  if (!valuation) return <p className="text-sm text-gray-400">Chargement...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{valuation.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{valuation.client.legalName}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {STEPS.map((s) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${
              step === s.key ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {step === "donnees" && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Données financières</h2>
          {fecImports.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => e.target.value && applyFecImport(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Préremplir depuis un import FEC...</option>
              {fecImports.map((f) => (
                <option key={f.id} value={f.id}>
                  Exercice {f.fiscalYear} — {f.fileName}
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Exercice de référence" value={inputs.fiscalYear} onChange={(v) => setInputs({ ...inputs, fiscalYear: v })} />
            <NumberField label="Chiffre d'affaires (€)" value={inputs.chiffreAffaires} onChange={(v) => setInputs({ ...inputs, chiffreAffaires: v })} />
            <NumberField label="EBITDA / EBE (€)" value={inputs.ebitda} onChange={(v) => setInputs({ ...inputs, ebitda: v })} />
            <NumberField label="EBIT (€)" value={inputs.ebit} onChange={(v) => setInputs({ ...inputs, ebit: v })} />
            <NumberField label="Résultat net (€)" value={inputs.resultatNet} onChange={(v) => setInputs({ ...inputs, resultatNet: v })} />
            <NumberField label="Dette financière nette (€)" value={inputs.netDebt} onChange={(v) => setInputs({ ...inputs, netDebt: v })} />
            <NumberField label="Capitaux propres comptables (€)" value={inputs.capitauxPropres} onChange={(v) => setInputs({ ...inputs, capitauxPropres: v })} />
          </div>
        </div>
      )}

      {step === "analyse" && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Analyse IA et recommandation de méthodes</h2>
            <button
              onClick={handleRecommend}
              disabled={loadingRecommend}
              className="flex items-center gap-2 bg-brand/10 text-brand rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand/20 disabled:opacity-50"
            >
              {loadingRecommend ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Analyser avec l&apos;IA
            </button>
          </div>
          {recommendation ? (
            <div className="bg-brand/5 rounded-xl p-4 text-sm space-y-2">
              <p className="font-medium">
                DCF {Math.round(recommendation.weights.dcf * 100)} % · Multiples {Math.round(recommendation.weights.multiples * 100)} % ·
                ANR {Math.round(recommendation.weights.anr * 100)} %
              </p>
              <p className="text-gray-600">{recommendation.rationale}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Lancez l&apos;analyse pour obtenir une recommandation de pondération.</p>
          )}
        </div>
      )}

      {step === "methodes" && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Pondération des méthodes</h2>
            <div className="grid grid-cols-3 gap-4">
              <PercentField label="DCF" value={weights.dcf} onChange={(v) => setWeights({ ...weights, dcf: v })} />
              <PercentField label="Multiples" value={weights.multiples} onChange={(v) => setWeights({ ...weights, multiples: v })} />
              <PercentField label="ANR" value={weights.anr} onChange={(v) => setWeights({ ...weights, anr: v })} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">DCF — hypothèses</h2>
            <div className="grid grid-cols-3 gap-4">
              <NumberField label="FCF de départ (€)" value={dcfAssumptions.fcfBase} onChange={(v) => setDcfAssumptions({ ...dcfAssumptions, fcfBase: v })} />
              <NumberField label="Croissance FCF (%)" value={dcfAssumptions.growthRate} onChange={(v) => setDcfAssumptions({ ...dcfAssumptions, growthRate: v })} />
              <NumberField label="WACC (%)" value={dcfAssumptions.wacc} onChange={(v) => setDcfAssumptions({ ...dcfAssumptions, wacc: v })} />
              <NumberField label="Croissance terminale (%)" value={dcfAssumptions.terminalGrowthRate} onChange={(v) => setDcfAssumptions({ ...dcfAssumptions, terminalGrowthRate: v })} />
              <NumberField label="Horizon (années)" value={dcfAssumptions.horizonYears} onChange={(v) => setDcfAssumptions({ ...dcfAssumptions, horizonYears: v })} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Multiples de comparables</h2>
              <button onClick={addMultipleLine} className="flex items-center gap-1 text-xs text-brand">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            {multipleLines.map((line, i) => (
              <div key={line.id} className="flex items-center gap-2">
                <input
                  value={line.label}
                  onChange={(e) => setMultipleLines((ls) => ls.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <select
                  value={line.metric}
                  onChange={(e) =>
                    setMultipleLines((ls) => ls.map((l, j) => (j === i ? { ...l, metric: e.target.value as MultipleLine["metric"] } : l)))
                  }
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="ebitda">EBITDA</option>
                  <option value="ebit">EBIT</option>
                  <option value="chiffreAffaires">CA</option>
                  <option value="resultatNet">Résultat net</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={line.multiple}
                  onChange={(e) => setMultipleLines((ls) => ls.map((l, j) => (j === i ? { ...l, multiple: Number(e.target.value) } : l)))}
                  className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button onClick={() => setMultipleLines((ls) => ls.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Actif net réévalué — ajustements</h2>
              <button onClick={addAnrAdjustment} className="flex items-center gap-1 text-xs text-brand">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            {anrAdjustments.map((adj, i) => (
              <div key={adj.id} className="flex items-center gap-2">
                <input
                  value={adj.label}
                  onChange={(e) => setAnrAdjustments((as) => as.map((a, j) => (j === i ? { ...a, label: e.target.value } : a)))}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={adj.amount}
                  onChange={(e) => setAnrAdjustments((as) => as.map((a, j) => (j === i ? { ...a, amount: Number(e.target.value) } : a)))}
                  className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <button onClick={() => setAnrAdjustments((as) => as.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "ajustements" && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Synthèse des hypothèses</h2>
          <p className="text-sm text-gray-500">
            Ajustez librement les hypothèses dans l&apos;étape « Méthodes ». Voici l&apos;impact en temps réel sur la valorisation.
          </p>
          <ResultsSummary results={results} />
        </div>
      )}

      {step === "restitution" && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold">Fourchette de valorisation</h2>
            <ResultsSummary results={results} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { name: "DCF", value: results.dcf?.equityValue ?? 0 },
                  { name: "Multiples", value: results.multiples?.averageEquityValue ?? 0 },
                  { name: "ANR", value: results.anr?.equityValue ?? 0 },
                  { name: "Pondérée", value: results.weightedEquityValue },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: unknown) => fmtEUR(Number(v))} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {["#6D5BF6", "#9b8af8", "#c4bbfb", "#3b2f9e"].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Commentaire IA</h2>
              <button
                onClick={handleNarrative}
                disabled={loadingNarrative}
                className="flex items-center gap-2 bg-brand/10 text-brand rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand/20 disabled:opacity-50"
              >
                {loadingNarrative ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                Générer le commentaire
              </button>
            </div>
            {narrative ? (
              <div className="space-y-3 text-sm text-gray-600">
                <p>{narrative.financialAnalysis}</p>
                <p>{narrative.methodsExplanation}</p>
                <p>{narrative.assumptionsExplanation}</p>
                <p className="font-medium text-gray-800">{narrative.conclusion}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun commentaire généré.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveVersion}
              disabled={saving}
              className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer une version"}
            </button>
            {saveFeedback && <span className="text-sm text-gray-500">{saveFeedback}</span>}
          </div>
        </div>
      )}

      {step === "rapport" && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Génération du rapport Word</h2>
          <p className="text-sm text-gray-500">
            Le rapport reprend la présentation de l&apos;entreprise, l&apos;analyse financière, les méthodes, les hypothèses et la
            conclusion rédigées par l&apos;IA, ainsi que la fourchette de valorisation retenue.
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={loadingReport}
            className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
          >
            {loadingReport ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
            Générer le rapport (.docx)
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsSummary({ results }: { results: ValuationResults }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Metric label="Min" value={fmtEUR(results.min)} />
      <Metric label="Médiane" value={fmtEUR(results.median)} />
      <Metric label="Retenue" value={fmtEUR(results.weightedEquityValue)} strong />
      <Metric label="Max" value={fmtEUR(results.max)} />
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-semibold text-brand" : "text-sm font-medium"}`}>{value}</p>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-sm space-y-1">
      <span className="text-xs text-gray-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

function PercentField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-sm space-y-1">
      <span className="text-xs text-gray-400">{label} (%)</span>
      <input
        type="number"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
      />
    </label>
  );
}
