import type Anthropic from "@anthropic-ai/sdk";
import { addItem, listItems } from "@/lib/editorial";
import { addPost } from "@/lib/social-posts";
import { alfredSystemBlock } from "@/lib/alfred-config";
import { siteKnowledgeBlock } from "@/lib/site-knowledge";
import { getPost } from "@/lib/blog";
import { getSetting } from "@/lib/settings";
import { addRoutine, listRoutines, describeSchedule, type RoutineFreq, type RoutineType } from "@/lib/alfred-routines";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type AgentResult = { reply: string; actions: string[] };

const OPERATING = `Tu aides John Lévy à piloter la communication du cabinet : calendrier éditorial, rédaction d'articles pour le site, déclinaison en posts réseaux (LinkedIn surtout) et newsletters. Français impeccable.

Le site www.trevys.fr est ta maison : tu en connais chaque page, chaque article, chaque vidéo et chaque média (voir la connaissance du site ci-dessous). Appuie-toi dessus pour faire des liens internes pertinents, éviter les doublons avec les articles existants, illustrer avec les médias disponibles et rester cohérent avec les pages du site.

Tes moyens d'action (outils) :
- rediger_article : quand on te demande un article, RÉDIGE-LE toi-même entièrement (titre, résumé, contenu Markdown structuré avec ## sous-titres) puis appelle cet outil. Le brouillon est enregistré pour relecture — il n'est PAS publié automatiquement.
- rediger_post : quand on te demande un post LinkedIn ou Instagram, RÉDIGE le texte final (accroche, corps aéré, hashtags) puis appelle cet outil. Le post part en brouillon dans la file de publications.
- planifier_publication : ajoute une échéance au calendrier éditorial (article, post LinkedIn, newsletter…).
- lister_calendrier : consulte le calendrier existant.
- lire_article : lis le contenu complet d'un article publié (via son slug) avant d'en parler, de le décliner en post ou de proposer une mise à jour.
- creer_routine / lister_routines : mets en place des automatismes récurrents (ex. « un article par semaine sur la RFE, le lundi »). Chaque exécution produit un BROUILLON à valider — jamais de publication directe.

Règles : respecte scrupuleusement le ton, la ligne éditoriale et les mots à éviter ci-dessus. Inspire-toi des exemples de publications passées pour retrouver le style « maison ». Après une action, confirme brièvement et propose la suite. Tu prépares, l'humain valide et publie.`;

function buildSystem(): string {
  return `${alfredSystemBlock()}\n\n---\n\nCONNAISSANCE DU SITE (état actuel, généré à l'instant) :\n\n${siteKnowledgeBlock()}\n\n---\n\n${OPERATING}`;
}

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
    name: "rediger_post",
    description:
      "Enregistre un brouillon de post réseau social (rédigé par toi, prêt à publier). Le post part dans la file de publications pour relecture — il n'est PAS publié automatiquement.",
    input_schema: {
      type: "object" as const,
      properties: {
        network: { type: "string", enum: ["linkedin", "instagram"] },
        content: { type: "string", description: "Texte final du post (avec hashtags)" },
      },
      required: ["network", "content"],
    },
  },
  {
    name: "lister_calendrier",
    description: "Renvoie les éléments du calendrier éditorial.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "creer_routine",
    description:
      "Crée une routine récurrente (ex. rédiger un article chaque semaine). Tout ce que produit une routine part en BROUILLON pour validation humaine. Les routines sont visibles et modifiables dans « Routines d'Alfred ».",
    input_schema: {
      type: "object" as const,
      properties: {
        label: { type: "string", description: "Nom court de la routine, ex. « Article hebdo RFE »" },
        type: { type: "string", enum: ["article", "linkedin", "instagram"] },
        freq: { type: "string", enum: ["quotidienne", "hebdomadaire", "mensuelle"] },
        weekday: { type: "number", description: "Jour de la semaine si hebdomadaire (0=dimanche … 6=samedi)" },
        monthday: { type: "number", description: "Jour du mois (1-28) si mensuelle" },
        topic: { type: "string", description: "La consigne : sujet, angle, thème à traiter" },
      },
      required: ["label", "type", "freq", "topic"],
    },
  },
  {
    name: "lister_routines",
    description: "Liste les routines récurrentes existantes.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "lire_article",
    description:
      "Renvoie le contenu complet (Markdown) d'un article publié du site, à partir de son slug (ex. « calendrier-2026-2027 »).",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Le slug de l'article (fin de l'URL /blog/<slug>)" },
      },
      required: ["slug"],
    },
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
  if (name === "rediger_post") {
    const net = input.network === "instagram" ? "instagram" : "linkedin";
    const p = addPost({ network: net, content: String(input.content ?? ""), status: "brouillon" });
    actions.push(`Brouillon de post ${net === "linkedin" ? "LinkedIn" : "Instagram"} créé`);
    return `Post enregistré (id ${p.id}) dans la file de publications, en brouillon.`;
  }
  if (name === "lister_calendrier") {
    return JSON.stringify(
      listItems().map((i) => ({ date: i.date, type: i.type, title: i.title, status: i.status })),
    );
  }
  if (name === "creer_routine") {
    const r = addRoutine({
      label: String(input.label ?? "Routine"),
      type: (input.type as RoutineType) ?? "article",
      freq: (input.freq as RoutineFreq) ?? "hebdomadaire",
      weekday: typeof input.weekday === "number" ? input.weekday : undefined,
      monthday: typeof input.monthday === "number" ? input.monthday : undefined,
      topic: String(input.topic ?? ""),
      enabled: true,
    });
    actions.push(`Routine créée : « ${r.label} » (${describeSchedule(r)})`);
    return `Routine enregistrée (${describeSchedule(r)}). Elle produira des brouillons à valider. Modifiable dans « Routines d'Alfred ».`;
  }
  if (name === "lister_routines") {
    return JSON.stringify(
      listRoutines().map((r) => ({
        label: r.label, type: r.type, planification: describeSchedule(r),
        sujet: r.topic, active: r.enabled, derniereExecution: r.lastRun ?? null, dernierResultat: r.lastResult ?? null,
      })),
    );
  }
  if (name === "lire_article") {
    const post = getPost(String(input.slug ?? ""));
    if (!post) return "Article introuvable — vérifie le slug dans la liste des articles publiés.";
    return `TITRE : ${post.meta.title}\nTHÈME : ${post.meta.category}\nDATE : ${post.meta.date}\nRÉSUMÉ : ${post.meta.excerpt ?? ""}\n\n${post.content.slice(0, 24_000)}`;
  }
  return "Outil inconnu.";
}

// Rédige un post réseau social (appel modèle unique, sans boucle d'outils).
// Renvoie le texte du post prêt à relire. Sans clé API, renvoie un gabarit.
export async function draftSocialPost(
  topic: string,
  network: "linkedin" | "instagram",
): Promise<{ content: string; generated: boolean }> {
  const apiKey = getSetting("anthropicApiKey");
  const netLabel = network === "linkedin" ? "LinkedIn" : "Instagram";

  if (!apiKey) {
    // Gabarit de secours pour travailler en brouillon sans IA.
    return {
      generated: false,
      content:
        `✍️ [Brouillon à compléter — ${netLabel}]\n\n${topic}\n\n` +
        `• Point clé 1\n• Point clé 2\n• Point clé 3\n\n` +
        `👉 Votre appel à l'action.\n\n#Trevys #ExpertiseComptable` +
        (network === "linkedin" ? " #Conseil" : ""),
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const consignes =
    network === "linkedin"
      ? "Format LinkedIn : accroche forte en première ligne, corps aéré (sauts de ligne, éventuelles puces), ton professionnel mais incarné, 3 à 6 hashtags pertinents en fin. Pas de titre Markdown."
      : "Format Instagram : plus court et percutant, ton chaleureux, quelques emojis pertinents, appel à l'action, 5 à 10 hashtags en fin.";

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: `${alfredSystemBlock()}\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\nTu rédiges UNIQUEMENT le texte final d'un post ${netLabel}, prêt à publier, sans commentaire ni balise. ${consignes}`,
    messages: [{ role: "user", content: `Rédige un post ${netLabel} sur : ${topic}` }],
  });

  const content = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  return { content: content || topic, generated: true };
}

// Rédige un article complet (appel modèle unique). Sans clé API, renvoie un
// gabarit à compléter — le brouillon existe quand même pour ne rien perdre.
export async function draftArticle(
  topic: string,
): Promise<{ title: string; category: string; excerpt: string; body: string; generated: boolean }> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) {
    return {
      generated: false,
      title: `[À rédiger] ${topic.slice(0, 80)}`,
      category: "Article",
      excerpt: "Brouillon créé par une routine — Alfred attend sa clé API pour rédiger.",
      body: `## ${topic}\n\n_(Alfred n'a pas pu rédiger : clé API non configurée — voir Réglages.)_\n\n- Point clé 1\n- Point clé 2\n- Point clé 3`,
    };
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system:
      `${alfredSystemBlock()}\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\n` +
      `Tu rédiges un article complet pour le blog du cabinet. Réponds EXACTEMENT dans ce format, sans rien d'autre :\n` +
      `TITRE: <titre>\nTHEME: <thème court, ex. Facturation électronique>\nRESUME: <1-2 phrases>\nCORPS:\n<contenu Markdown structuré avec ## sous-titres, listes, gras — 600 à 900 mots>`,
    messages: [{ role: "user", content: `Rédige un article sur : ${topic}` }],
  });

  const raw = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  const title = raw.match(/^TITRE:\s*(.+)$/m)?.[1]?.trim() || topic.slice(0, 80);
  const category = raw.match(/^THEME:\s*(.+)$/m)?.[1]?.trim() || "Article";
  const excerpt = raw.match(/^RESUME:\s*(.+)$/m)?.[1]?.trim() || "";
  const body = (raw.split(/^CORPS:\s*$/m)[1] ?? raw).trim();

  return { title, category, excerpt, body, generated: true };
}

// Modifie un contenu Markdown selon une instruction (appel modèle unique).
// Renvoie le texte révisé, prêt à relire. Sans clé API, lève une erreur claire.
export async function reviseText(content: string, instruction: string): Promise<string> {
  const apiKey = getSetting("anthropicApiKey");
  if (!apiKey) {
    throw new Error("Alfred n'est pas configuré (clé API manquante — voir Réglages).");
  }

  const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
  const client = new AnthropicSDK({ apiKey });

  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system:
      `${alfredSystemBlock()}\n\n---\n\nCONNAISSANCE DU SITE :\n${siteKnowledgeBlock()}\n\n---\n\nTu es l'assistant de rédaction du cabinet. On te donne un contenu d'article en Markdown et une instruction de modification. ` +
      `Renvoie UNIQUEMENT le contenu Markdown complet révisé (aucun commentaire, aucune balise de code, aucune explication). ` +
      `Conserve la mise en forme Markdown (## sous-titres, listes, gras, liens, images) et le ton « maison ». Si l'instruction ne concerne qu'une partie, ne réécris pas le reste inutilement.`,
    messages: [
      {
        role: "user",
        content: `Instruction : ${instruction}\n\n--- CONTENU ACTUEL ---\n${content || "(vide)"}`,
      },
    ],
  });

  const revised = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .trim();

  return revised || content;
}

export async function runCommsAgent(history: ChatTurn[]): Promise<AgentResult> {
  const apiKey = getSetting("anthropicApiKey");
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
      system: buildSystem(),
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
