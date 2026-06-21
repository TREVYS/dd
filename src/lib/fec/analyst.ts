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
