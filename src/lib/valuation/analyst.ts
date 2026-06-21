import { FinancialInputs, MethodWeights, ValuationResults } from "./engine";

const SYSTEM_PROMPT = `Tu es un expert en évaluation d'entreprise (M&A / transmission) pour un cabinet d'expertise comptable (TREVYS).
Tu maîtrises les méthodes DCF, multiples de comparables et actif net réévalué (cf. doctrine Vernimmen).
Tu expliques tes choix de façon pédagogique à un dirigeant ou un expert-comptable qui n'est pas un spécialiste finance.
Réponds en français, de façon concise et structurée. Tu ne réinventes jamais les chiffres fournis.`;

function buildContext(financials: FinancialInputs) {
  return `Exercice de référence : ${financials.fiscalYear}
Chiffre d'affaires : ${financials.chiffreAffaires} €
EBITDA (EBE) : ${financials.ebitda} €
EBIT (résultat d'exploitation) : ${financials.ebit} €
Résultat net : ${financials.resultatNet} €
Dette financière nette : ${financials.netDebt} €
Capitaux propres comptables : ${financials.capitauxPropres} €`;
}

export type MethodRecommendation = {
  weights: MethodWeights;
  rationale: string;
};

const DEFAULT_RECOMMENDATION: MethodRecommendation = {
  weights: { dcf: 0.5, multiples: 0.4, anr: 0.1 },
  rationale:
    "Recommandation par défaut (assistant IA non configuré) : pondération équilibrée entre DCF et multiples, avec un poids résiduel sur l'actif net réévalué. Ajustez ces poids selon votre connaissance du dossier.",
};

export async function recommendMethods(financials: FinancialInputs): Promise<MethodRecommendation> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return DEFAULT_RECOMMENDATION;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `À partir des données financières suivantes, recommande une pondération entre les 3 méthodes de
valorisation (DCF, multiples, actif net réévalué), en justifiant ton choix en 2-3 phrases (ex : nature de
l'activité, récurrence des flux, poids du patrimoine...).

${buildContext(financials)}

Réponds UNIQUEMENT en JSON avec ce format exact (les 3 poids doivent sommer à 1) :
{"weights": {"dcf": 0.6, "multiples": 0.4, "anr": 0}, "rationale": "..."}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return DEFAULT_RECOMMENDATION;
    const parsed = JSON.parse(jsonMatch[0]);
    const weights = parsed.weights ?? DEFAULT_RECOMMENDATION.weights;
    return {
      weights: { dcf: Number(weights.dcf) || 0, multiples: Number(weights.multiples) || 0, anr: Number(weights.anr) || 0 },
      rationale: parsed.rationale ?? DEFAULT_RECOMMENDATION.rationale,
    };
  } catch {
    return DEFAULT_RECOMMENDATION;
  }
}

export type ValuationNarrative = {
  financialAnalysis: string;
  methodsExplanation: string;
  assumptionsExplanation: string;
  conclusion: string;
};

const FALLBACK_NARRATIVE: ValuationNarrative = {
  financialAnalysis: "Analyse non disponible (assistant IA non configuré). Consultez les indicateurs bruts ci-dessus.",
  methodsExplanation: "Description non disponible (assistant IA non configuré).",
  assumptionsExplanation: "Explication non disponible (assistant IA non configuré).",
  conclusion: "Synthèse non disponible (assistant IA non configuré).",
};

export async function generateNarrative(
  financials: FinancialInputs,
  results: ValuationResults
): Promise<ValuationNarrative> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return FALLBACK_NARRATIVE;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Rédige les textes pédagogiques d'un rapport de valorisation d'entreprise à partir des données et
résultats suivants.

${buildContext(financials)}

Résultats de la valorisation (€) :
- DCF : ${results.dcf?.equityValue ?? "non calculé"}
- Multiples (moyenne) : ${results.multiples?.averageEquityValue ?? "non calculé"}
- Actif net réévalué : ${results.anr?.equityValue ?? "non calculé"}
- Pondérations : DCF ${results.weights.dcf}, Multiples ${results.weights.multiples}, ANR ${results.weights.anr}
- Valeur pondérée retenue : ${results.weightedEquityValue}
- Fourchette : min ${results.min} / médiane ${results.median} / max ${results.max}

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "financialAnalysis": "analyse de la rentabilité, du BFR, de la croissance et des risques en 6-10 lignes",
  "methodsExplanation": "description pédagogique des méthodes retenues et pourquoi, en 4-6 lignes",
  "assumptionsExplanation": "explication de l'impact des hypothèses retenues (taux, multiples) en 4-6 lignes",
  "conclusion": "synthèse exécutive de la valorisation en 6-8 lignes, avec la valeur retenue et la fourchette"
}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return FALLBACK_NARRATIVE;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      financialAnalysis: parsed.financialAnalysis ?? FALLBACK_NARRATIVE.financialAnalysis,
      methodsExplanation: parsed.methodsExplanation ?? FALLBACK_NARRATIVE.methodsExplanation,
      assumptionsExplanation: parsed.assumptionsExplanation ?? FALLBACK_NARRATIVE.assumptionsExplanation,
      conclusion: parsed.conclusion ?? FALLBACK_NARRATIVE.conclusion,
    };
  } catch {
    return FALLBACK_NARRATIVE;
  }
}
