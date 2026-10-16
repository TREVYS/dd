// Modèle « blocs » de l'éditeur visuel : chaque bloc correspond à une ligne
// ou un petit groupe de lignes du Markdown utilisé partout dans le cockpit
// (articles, newsletters, offres, pages légales…). L'utilisateur ne manipule
// jamais le Markdown : il choisit un type de bloc (paragraphe, titre, liste…)
// et tape du texte normal, mis en forme à l'écran (gras affiché gras, etc.).
// parseMarkdown / serializeBlocks sont l'aller-retour qui garde le fichier
// stocké strictement identique à ce que produisait l'ancien éditeur.

export type BlockType = "p" | "h2" | "h3" | "quote" | "li" | "oli" | "hr" | "img" | "video" | "tags";

export type Block = {
  id: string;
  type: BlockType;
  html?: string; // contenu inline (HTML limité : b, i, a) pour p/h2/h3/quote/li/oli
  imageUrl?: string;
  imageAlt?: string;
  imagePos?: "droite" | "gauche"; // vignette positionnée (article) — absent = pleine largeur
  videoId?: string;
  tags?: string[]; // newsletter : ligne [[Tag]] [[Tag2]]
};

let seq = 0;
const nid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

// --- Markdown (brut) -> HTML inline limité (gras, italique, liens, code) ---
function mdInlineToHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

// --- HTML inline limité -> Markdown brut (inverse de la fonction ci-dessus) ---
export function htmlInlineToMd(html: string): string {
  let s = html
    // Normalise les variantes que le navigateur peut produire.
    .replace(/<div>/gi, "\n").replace(/<\/div>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<(strong)>/gi, "<b>").replace(/<\/(strong)>/gi, "</b>")
    .replace(/<(em)>/gi, "<i>").replace(/<\/(em)>/gi, "</i>")
    .replace(/<b>\s*<\/b>/gi, "").replace(/<i>\s*<\/i>/gi, "")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, "") // tout autre tag collé par le navigateur : retiré
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
  return s.trim();
}

function block(type: BlockType, text = ""): Block {
  return { id: nid(), type, html: mdInlineToHtml(text) };
}

// Markdown -> blocs (même grammaire que markdownToEmailHtml / mdToHtml).
export function parseMarkdown(md: string): Block[] {
  const lines = (md || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let buf: string[] = [];
  const flushPara = () => {
    if (buf.length) {
      blocks.push(block("p", buf.join(" ")));
      buf = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpMatchArray | null;
    if (/^#{2}\s+/.test(line)) { flushPara(); blocks.push(block("h2", line.replace(/^#{2}\s+/, ""))); }
    else if (/^#{3}\s+/.test(line)) { flushPara(); blocks.push(block("h3", line.replace(/^#{3}\s+/, ""))); }
    else if (/^>\s?/.test(line)) { flushPara(); blocks.push(block("quote", line.replace(/^>\s?/, ""))); }
    else if (/^[-*]\s+/.test(line)) { flushPara(); blocks.push(block("li", line.replace(/^[-*]\s+/, ""))); }
    else if (/^\d+\.\s+/.test(line)) { flushPara(); blocks.push(block("oli", line.replace(/^\d+\.\s+/, ""))); }
    else if (/^---+$/.test(line.trim())) { flushPara(); blocks.push({ id: nid(), type: "hr" }); }
    else if (/^(\[\[[^\]]+\]\]\s*)+$/.test(line.trim())) {
      flushPara();
      const tags = [...line.matchAll(/\[\[([^\]]+)\]\]/g)].map((t) => t[1].trim());
      blocks.push({ id: nid(), type: "tags", tags });
    } else if ((m = line.match(/^<YouTube\s+id=["']([A-Za-z0-9_-]{11})["']\s*\/>$/))) {
      flushPara();
      blocks.push({ id: nid(), type: "video", videoId: m[1] });
    } else if ((m = line.match(/^!\[([^\]]*)\|(droite|gauche)\]\(([^)\s]+)\)\s*$/i))) {
      flushPara();
      blocks.push({ id: nid(), type: "img", imageUrl: m[3], imageAlt: m[1], imagePos: m[2].toLowerCase() as "droite" | "gauche" });
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      flushPara();
      blocks.push({ id: nid(), type: "img", imageUrl: m[2], imageAlt: m[1] });
    } else if (line.trim() === "") {
      flushPara();
    } else {
      buf.push(line);
    }
  }
  flushPara();
  return blocks.length ? blocks : [block("p", "")];
}

// Blocs -> Markdown (inverse de parseMarkdown).
export function serializeBlocks(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    const text = htmlInlineToMd(b.html ?? "");
    switch (b.type) {
      case "h2": out.push(`## ${text}`); break;
      case "h3": out.push(`### ${text}`); break;
      case "quote": out.push(`> ${text}`); break;
      case "li": out.push(`- ${text}`); break;
      case "oli": out.push(`1. ${text}`); break;
      case "hr": out.push("---"); break;
      case "tags": out.push((b.tags ?? []).map((t) => `[[${t}]]`).join(" ")); break;
      case "video": out.push(`<YouTube id="${b.videoId}" />`); break;
      case "img":
        out.push(b.imagePos ? `![${b.imageAlt ?? ""}|${b.imagePos}](${b.imageUrl})` : `![${b.imageAlt ?? ""}](${b.imageUrl})`);
        break;
      default: out.push(text);
    }
  }
  // Fusionne les lignes de liste consécutives (pas de ligne vide entre elles,
  // comme attend le rendu final), sépare le reste par une ligne vide.
  const lines: string[] = [];
  for (let i = 0; i < out.length; i++) {
    const prevType = blocks[i - 1]?.type;
    const curType = blocks[i]?.type;
    const sameList = (curType === "li" && prevType === "li") || (curType === "oli" && prevType === "oli");
    if (i > 0) lines.push(sameList ? "\n" : "\n\n");
    lines.push(out[i]);
  }
  return lines.join("");
}

export function newBlock(type: BlockType): Block {
  if (type === "hr") return { id: nid(), type };
  return block(type, "");
}
