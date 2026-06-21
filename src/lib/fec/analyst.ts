import { FecMetrics } from "./analyze";
import { Anomaly } from "./analyze";

const SYSTEM_PROMPT = `Tu es un analyste financier senior pour un cabinet d'expertise comptable (TREVYS).
Tu te comportes comme un DAF, un banquier et un conseiller en gestion : tu lis des indicateurs comptables
issus d'un FEC et tu produis des diagnostics clairs, pédagogiques et orientés décision pour un dirigeant.
Tu ne réinventes jamais les chiffres fournis, tu les commentes et les mets en perspective.
Réponds en français, de façon concise et structurée.`;

function buildContext(metrics: FecMetrics, anomalies: Anomaly[]) {
  return `Exercice analysé: ${metrics.fiscalYear}
Nombre de lignes FEC: ${metrics.lineCount}, journaux: ${metrics.journals.join(", ")}

Compte de résultat synthétique (€):
- Chiffre d'affaires: ${metrics.totals.chiffreAffaires}
- Achats: ${metrics.totals.achats}
- Charges externes: ${metrics.totals.chargesExternes}
- Charges de personnel: ${metrics.totals.chargesPersonnel}
- Impôts et taxes: ${metrics.totals.impotsTaxes}
- Charges financières: ${metrics.totals.chargesFinancieres} / Produits financiers: ${metrics.totals.produitsFinanciers}
- Charges exceptionnelles: ${metrics.totals.chargesExceptionnelles} / Produits exceptionnels: ${metrics.totals.produitsExceptionnels}
- Dotations: ${metrics.totals.dotations} / Reprises: ${metrics.totals.reprises}
- Valeur ajoutée: ${metrics.totals.valeurAjoutee}
- EBE: ${metrics.totals.ebe}
- Résultat d'exploitation: ${metrics.totals.resultatExploitation}
- RCAI: ${metrics.totals.rcai}
- Résultat net: ${metrics.totals.resultatNet}

Ratios:
- Taux de valeur ajoutée: ${metrics.ratios.tauxValeurAjoutee}%
- Taux d'EBE: ${metrics.ratios.tauxEbe}%
- Taux de résultat net: ${metrics.ratios.tauxResultatNet}%

Top clients (comptes 411, par débit cumulé): ${JSON.stringify(metrics.topClients)}
Top fournisseurs (comptes 401, par crédit cumulé): ${JSON.stringify(metrics.topFournisseurs)}
Comptes courants d'associés (455): ${JSON.stringify(metrics.comptesCourantsAssocies)}
Comptes d'attente (471/472/467): ${JSON.stringify(metrics.comptesAttente)}

Anomalies détectées lors des contrôles automatiques:
${anomalies.map((a) => `- [${a.severity}] ${a.message}`).join("\n") || "Aucune anomalie significative."}`;
}

export async function askFinancialAnalyst(
  metrics: FecMetrics,
  anomalies: Anomaly[],
  question: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "L'assistant IA n'est pas configuré (clé API manquante). Voici les indicateurs bruts disponibles : " +
      JSON.stringify(metrics.totals);
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `${SYSTEM_PROMPT}\n\nDonnées de l'exercice analysé:\n${buildContext(metrics, anomalies)}`,
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: question },
    ],
  });

  return message.content.find((b) => b.type === "text")?.text ?? "Je n'ai pas pu générer de réponse.";
}

export async function generateReportContent(
  metrics: FecMetrics,
  anomalies: Anomaly[],
  reportType: string,
  tone: string
): Promise<{ summary: string; sections: { title: string; body: string }[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const fallback = {
    summary: `Synthèse automatique non disponible (IA non configurée). Chiffre d'affaires: ${metrics.totals.chiffreAffaires} €, résultat net: ${metrics.totals.resultatNet} €.`,
    sections: [
      { title: "Chiffres clés", body: JSON.stringify(metrics.totals) },
      { title: "Anomalies", body: anomalies.map((a) => a.message).join("\n") },
    ],
  };
  if (!apiKey) return fallback;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Rédige un rapport de type "${reportType}" avec un ton "${tone}" à partir des données suivantes:
${buildContext(metrics, anomalies)}

Réponds UNIQUEMENT en JSON avec ce format exact:
{"summary": "synthèse exécutive de 5-8 lignes", "sections": [{"title": "...", "body": "..."}, ...]}
Inclus au minimum les sections: Chiffres clés, Analyse de l'activité, Marges et rentabilité, Points d'attention, Recommandations.`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      summary: parsed.summary ?? fallback.summary,
      sections: Array.isArray(parsed.sections) ? parsed.sections : fallback.sections,
    };
  } catch {
    return fallback;
  }
}

export type OpportunityDraft = {
  domain: "fiscal" | "social" | "juridique" | "finance";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedValue: number | null;
};

export async function generateOpportunities(
  metrics: FecMetrics,
  anomalies: Anomaly[]
): Promise<OpportunityDraft[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `À partir des données financières suivantes, identifie des opportunités de missions complémentaires
pour le cabinet d'expertise comptable, dans les domaines fiscal, social, juridique et finance
(ex: optimisation IS, intégration fiscale, crédits d'impôt, rémunération/dividendes/intéressement,
pacte d'associés/holding/transmission, financement/levée de fonds/restructuration).

${buildContext(metrics, anomalies)}

Réponds UNIQUEMENT en JSON avec ce format exact (3 à 8 opportunités, priorisées) :
{"opportunities": [{"domain": "fiscal|social|juridique|finance", "title": "...", "description": "...", "priority": "low|medium|high", "estimatedValue": 1500}]}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.opportunities)) return [];
    return parsed.opportunities.map((o: Record<string, unknown>) => ({
      domain: ["fiscal", "social", "juridique", "finance"].includes(o.domain as string) ? o.domain : "finance",
      title: String(o.title ?? "Opportunité de mission"),
      description: String(o.description ?? ""),
      priority: ["low", "medium", "high"].includes(o.priority as string) ? o.priority : "medium",
      estimatedValue: typeof o.estimatedValue === "number" ? o.estimatedValue : null,
    })) as OpportunityDraft[];
  } catch {
    return [];
  }
}

export type MeetingPrep = {
  pointsForts: string[];
  pointsFaibles: string[];
  questionsAPoser: string[];
  planAction: { horizon30j: string[]; horizon90j: string[]; horizon12m: string[] };
  pitchAssocie: string;
  generatedAt: string;
};

const MEETING_PREP_FALLBACK: Omit<MeetingPrep, "generatedAt"> = {
  pointsForts: [],
  pointsFaibles: [],
  questionsAPoser: [],
  planAction: { horizon30j: [], horizon90j: [], horizon12m: [] },
  pitchAssocie:
    "Préparation indisponible : l'assistant IA n'est pas configuré (clé API manquante). Consultez les indicateurs et anomalies bruts ci-dessus.",
};

export async function generateMeetingPrep(
  metrics: FecMetrics,
  anomalies: Anomaly[],
  opportunities: OpportunityDraft[]
): Promise<MeetingPrep> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ...MEETING_PREP_FALLBACK, generatedAt: new Date().toISOString() };

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
          content: `Bouton magique TREVYS : prépare en quelques secondes le rendez-vous bilan de l'associé avec ce client,
à partir des données ci-dessous et des opportunités de mission déjà identifiées.

${buildContext(metrics, anomalies)}

Opportunités de mission déjà identifiées: ${JSON.stringify(opportunities)}

Réponds UNIQUEMENT en JSON avec ce format exact :
{
  "pointsForts": ["5 points qui vont bien"],
  "pointsFaibles": ["5 points qui vont mal"],
  "questionsAPoser": ["10 questions à poser au dirigeant"],
  "planAction": {"horizon30j": ["..."], "horizon90j": ["..."], "horizon12m": ["..."]},
  "pitchAssocie": "résumé exécutif de 10 lignes pour que l'associé arrive en rendez-vous avec une vision complète sans avoir à tout relire"
}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ...MEETING_PREP_FALLBACK, generatedAt: new Date().toISOString() };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      pointsForts: Array.isArray(parsed.pointsForts) ? parsed.pointsForts : [],
      pointsFaibles: Array.isArray(parsed.pointsFaibles) ? parsed.pointsFaibles : [],
      questionsAPoser: Array.isArray(parsed.questionsAPoser) ? parsed.questionsAPoser : [],
      planAction: {
        horizon30j: parsed.planAction?.horizon30j ?? [],
        horizon90j: parsed.planAction?.horizon90j ?? [],
        horizon12m: parsed.planAction?.horizon12m ?? [],
      },
      pitchAssocie: parsed.pitchAssocie ?? MEETING_PREP_FALLBACK.pitchAssocie,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return { ...MEETING_PREP_FALLBACK, generatedAt: new Date().toISOString() };
  }
}
