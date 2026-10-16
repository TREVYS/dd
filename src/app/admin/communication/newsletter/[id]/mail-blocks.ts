// Analyse et reconstruction du corps Markdown d'un mailing composé à partir
// d'articles (voir createArticlesCampaignAction). Permet de réordonner les
// articles par glisser-déposer sans toucher au reste (accroche, vidéo,
// signature) — reconnaît EXACTEMENT le format que le cockpit génère.
const SEP = "\n\n---\n\n";

export type ArticleBlock = { key: string; tag: string | null; title: string; text: string };

export type ParsedBody = {
  head: string; // tout ce qui précède le premier article (accroche)
  blocks: ArticleBlock[];
  tail: string; // tout ce qui suit (vidéo éventuelle + signature), inchangé
};

// Découpe une section « métier » ([[Tag]]\n### A\n\n### B…) en articles.
function splitArticles(section: string, tag: string | null): ArticleBlock[] {
  const body = tag ? section.replace(/^\[\[[^\]]+\]\]\n/, "") : section;
  const parts = body.split(/\n\n(?=###\s)/);
  return parts
    .filter((p) => /^###\s/.test(p))
    .map((text, i) => ({
      key: `${tag ?? "x"}-${i}-${text.slice(4, 30)}`,
      tag,
      title: text.replace(/^###\s+/, "").split("\n")[0].trim(),
      text,
    }));
}

export function parseBody(body: string): ParsedBody | null {
  const sections = body.split(SEP);
  const blocks: ArticleBlock[] = [];
  let headEnd = -1;
  let tailStart = -1;

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    const tagMatch = s.match(/^\[\[([^\]]+)\]\]\n/);
    const isArticleSection = tagMatch ? /###\s/.test(s) : /^###\s/.test(s.trim()) && !/^###\s*En vidéo/.test(s.trim());
    if (isArticleSection) {
      if (headEnd === -1) headEnd = i;
      blocks.push(...splitArticles(s, tagMatch ? tagMatch[1].trim() : null));
    } else if (headEnd !== -1 && tailStart === -1) {
      tailStart = i; // première section non-article après le dernier article
    }
  }

  if (blocks.length === 0 || headEnd === -1) return null;
  if (tailStart === -1) tailStart = sections.length;

  return {
    head: sections.slice(0, headEnd).join(SEP),
    blocks,
    tail: sections.slice(tailStart).join(SEP),
  };
}

// Reconstruit le corps Markdown à partir de l'ordre choisi — regroupe les
// articles consécutifs partageant le même tag sous une seule étiquette,
// comme le fait la composition automatique initiale.
export function buildBody(parsed: ParsedBody, order: ArticleBlock[]): string {
  const groups: { tag: string | null; texts: string[] }[] = [];
  for (const b of order) {
    const last = groups[groups.length - 1];
    if (last && last.tag === b.tag) last.texts.push(b.text);
    else groups.push({ tag: b.tag, texts: [b.text] });
  }
  const rendered = groups.map((g) => {
    const body = g.texts.join("\n\n");
    return g.tag ? `[[${g.tag}]]\n${body}` : body;
  });
  const middle = rendered.join(SEP);
  return [parsed.head, middle, parsed.tail].filter(Boolean).join(SEP);
}
