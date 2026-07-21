import type Anthropic from "@anthropic-ai/sdk";
import { addItem, listItems } from "@/lib/editorial";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type AgentResult = { reply: string; actions: string[] };

const SYSTEM = `Tu es le « Directeur de communication » de Trevys — cabinet d'expertise comptable et de conseil à Paris (expertise comptable, consulting, IA, facturation électronique).

Ton rôle : aider John Lévy à piloter la communication du cabinet — calendrier éditorial, rédaction d'articles pour le site, déclinaison en posts réseaux (LinkedIn surtout) et newsletters.

Ta voix : professionnelle, claire, crédible, orientée dirigeants et DAF. Français impeccable. Jamais de promesse d'« optimisation fiscale » (parle de « fiscalité maîtrisée », « juste imposition »).

Tes moyens d'action (outils) :
- rediger_article : quand on te demande un article, RÉDIGE-LE toi-même entièrement (titre, résumé, contenu Markdown structuré avec ## sous-titres) puis appelle cet outil. Le brouillon est enregistré pour relecture — il n'est PAS publié automatiquement.
- planifier_publication : ajoute une échéance au calendrier éditorial (article, post LinkedIn, newsletter…).
- lister_calendrier : consulte le calendrier existant.

Règles : propose toujours des sujets ancrés dans l'actualité du métier. Après une action, confirme brièvement ce que tu as fait et propose la prochaine étape. Tu prépares, l'humain valide et publie.`;

const TOOLS = [
  {
    name: "rediger_article",
    description:
      "Enregistre un brouillon d'article (rédigé par toi) pour le site, en attente de relecture et de publication.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        category: { type: "string", description: "Thème : Fiscalité, Comptabilité, Facturation électronique, Innovation…" },
        excerpt: { type: "string", description: "Résumé en 1-2 phrases" },
        body: { type: "string", description: "Contenu complet en Markdown (## sous-titres, listes, gras)" },
      },
      required: ["title", "excerpt", "body"],
    },
  },
  {
    name: "planifier_publication",
    description: "Ajoute une échéance au calendrier éditorial.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date AAAA-MM-JJ" },
        type: { type: "string", enum: ["article", "linkedin", "instagram", "newsletter", "idee"] },
        title: { type: "string" },
      },
      required: ["date", "type", "title"],
    },
  },
  {
    name: "lister_calendrier",
    description: "Renvoie les éléments du calendrier éditorial.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

function runTool(name: string, input: Record<string, unknown>, actions: string[]): string {
  if (name === "rediger_article") {
    const it = addItem({
      date: new Date().toISOString().slice(0, 10),
      type: "article",
      title: String(input.title ?? "Sans titre"),
      status: "brouillon",
      category: input.category ? String(input.category) : "Article",
      excerpt: String(input.excerpt ?? ""),
      body: String(input.body ?? ""),
    });
    actions.push(`Brouillon d'article créé : « ${it.title} »`);
    return `Brouillon enregistré (id ${it.id}). À relire dans le calendrier avant publication.`;
  }
  if (name === "planifier_publication") {
    const it = addItem({
      date: String(input.date ?? new Date().toISOString().slice(0, 10)),
      type: (input.type as never) ?? "idee",
      title: String(input.title ?? ""),
      status: "planifie",
    });
    actions.push(`Planifié le ${it.date} : « ${it.title} » (${it.type})`);
    return `Ajouté au calendrier le ${it.date}.`;
  }
  if (name === "lister_calendrier") {
    return JSON.stringify(
      listItems().map((i) => ({ date: i.date, type: i.type, title: i.title, status: i.status })),
    );
  }
  return "Outil inconnu.";
}

export async function runCommsAgent(history: ChatTurn[]): Promise<AgentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      reply:
        "L'assistant IA n'est pas encore configuré (clé ANTHROPIC_API_KEY manquante côté serveur).",
      actions: [],
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  // messages: on démarre à partir de l'historique texte.
  const messages: Anthropic.MessageParam[] = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  const actions: string[] = [];
  let text = "";

  for (let step = 0; step < 6; step++) {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    for (const block of res.content) {
      if (block.type === "text") text += block.text;
    }

    if (res.stop_reason !== "tool_use") break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of res.content) {
      if (block.type === "tool_use") {
        const out = runTool(block.name, block.input as Record<string, unknown>, actions);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: out });
      }
    }
    messages.push({ role: "assistant", content: res.content });
    messages.push({ role: "user", content: toolResults });
  }

  return { reply: text.trim() || "C'est fait.", actions };
}
