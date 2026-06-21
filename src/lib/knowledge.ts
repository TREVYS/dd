import { prisma } from "@/lib/prisma";

export type KnowledgeMatch = {
  id: string;
  title: string;
  category: string | null;
  content: string;
};

export async function searchKnowledge(query: string, limit = 5): Promise<KnowledgeMatch[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 8);

  if (terms.length === 0) return [];

  const articles = await prisma.knowledgeArticle.findMany({
    where: { status: "validee" },
    select: { id: true, title: true, category: true, content: true, tags: true },
  });

  const scored = articles
    .map((a) => {
      const haystack = `${a.title} ${a.content} ${a.tags ?? ""}`.toLowerCase();
      const score = terms.reduce((acc, t) => acc + (haystack.includes(t) ? 1 : 0), 0);
      return { article: a, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => ({
    id: s.article.id,
    title: s.article.title,
    category: s.article.category,
    content: s.article.content,
  }));
}

export type WebResult = { title: string; url: string; snippet: string };

export async function searchWeb(query: string, limit = 5): Promise<WebResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: limit,
        search_depth: "basic",
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    return results.slice(0, limit).map((r: { title?: string; url?: string; content?: string }) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      snippet: r.content ?? "",
    }));
  } catch {
    return [];
  }
}

export async function askKnowledgeAI(
  question: string,
  matches: KnowledgeMatch[],
  useWeb = false
): Promise<{ answer: string; source: "ai" | "fallback"; webResults: WebResult[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const webResults = useWeb ? await searchWeb(question) : [];
  const webNotice =
    useWeb && webResults.length === 0
      ? "\n\n(Recherche internet demandée mais indisponible : TAVILY_API_KEY non configurée ou aucun résultat.)"
      : "";

  if (!apiKey) {
    if (matches.length === 0 && webResults.length === 0) {
      return {
        answer:
          "Aucun article ne correspond à cette question dans la documentation du cabinet." +
          webNotice +
          " (Réponse générée par IA indisponible : ANTHROPIC_API_KEY non configurée.)",
        source: "fallback",
        webResults,
      };
    }
    const webLines = webResults.map((w) => `• ${w.title} (${w.url})`).join("\n");
    return {
      answer:
        `Voici les éléments les plus pertinents trouvés (réponse générée par IA indisponible : ANTHROPIC_API_KEY non configurée) :\n\n` +
        `Documentation interne :\n${matches.map((m) => `• ${m.title}`).join("\n") || "(aucun)"}` +
        (useWeb ? `\n\nRésultats internet :\n${webLines || "(aucun)"}` : ""),
      source: "fallback",
      webResults,
    };
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const context = matches
      .map((m) => `### ${m.title}\n${m.content}`)
      .join("\n\n");

    const webContext = webResults
      .map((w) => `### ${w.title} (${w.url})\n${w.snippet}`)
      .join("\n\n");

    const prompt = useWeb
      ? `Tu es l'assistant documentaire interne d'un cabinet d'expertise comptable. Réponds à la question du collaborateur en priorité à partir de la documentation interne ci-dessous. Si elle ne suffit pas, complète avec les résultats internet fournis, en citant clairement tes sources (interne vs internet, avec URL).

Documentation interne :
${context || "(aucun article pertinent trouvé)"}

Résultats internet :
${webContext || "(aucun résultat internet)"}

Question : ${question}`
      : `Tu es l'assistant documentaire interne d'un cabinet d'expertise comptable. Réponds à la question du collaborateur UNIQUEMENT à partir des articles ci-dessous. Si la réponse n'y figure pas, dis-le clairement et invite à consulter un manager ou à relancer la recherche avec l'option « Internet ».

Articles disponibles :
${context || "(aucun article pertinent trouvé)"}

Question : ${question}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    return { answer: text || "Je n'ai pas pu générer de réponse.", source: "ai", webResults };
  } catch {
    return {
      answer:
        "Une erreur est survenue lors de la génération de la réponse IA. Voici les articles trouvés :\n\n" +
        matches.map((m) => `• ${m.title}`).join("\n"),
      source: "fallback",
      webResults,
    };
  }
}
