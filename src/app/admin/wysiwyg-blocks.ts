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
  hashes?: string; // sous-titre de niveau 4 à 6 (#### …) : niveau d'origine conservé à l'enregistrement
};

let seq = 0;
const nid = () => `b${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

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
// stableIds : identifiants prévisibles (s0, s1…) pour le contenu initial de
// l'éditeur — la page est d'abord rendue par le serveur puis reprise par le
// navigateur, et les deux doivent attribuer les mêmes identifiants, sinon
// l'éditeur ne retrouve plus ses blocs à l'écran (curseur perdu).
export function parseMarkdown(md: string, stableIds = false): Block[] {
  const blocks = parseMarkdownRaw(md);
  if (stableIds) blocks.forEach((b, i) => { b.id = `s${i}`; });
  return blocks;
}

function parseMarkdownRaw(md: string): Block[] {
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
    else if ((m = line.match(/^(#{4,6})\s+(.*)$/))) { flushPara(); blocks.push({ ...block("h3", m[2]), hashes: m[1] }); }
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
      case "h3": out.push(`${b.hashes ?? "###"} ${text}`); break;
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

// --- HTML collé (Word, Google Docs, page web, e-mail, ChatGPT…) -> Markdown ---
// On ne garde que la structure utile : paragraphes, titres, listes, citations,
// gras, italique et liens. Tout le reste (polices, couleurs, tableaux de mise
// en page) est abandonné : le texte arrive propre, au style du site.
export function htmlToMarkdown(html: string): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  const BLOCKS = new Set(["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "UL", "OL", "BLOCKQUOTE", "TABLE", "TR", "HR", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "PRE", "FIGURE"]);

  const esc = (t: string) => t.replace(/\s+/g, " ");
  const wrap = (mark: string, t: string) => {
    const m = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return m && m[2] ? `${m[1]}${mark}${m[2]}${mark}${m[3]}` : t;
  };

  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return esc(node.textContent ?? "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === "BR") return " ";
    if (tag === "STYLE" || tag === "SCRIPT" || tag === "META" || tag === "IMG") return "";
    let t = Array.from(el.childNodes).map(inline).join("");
    const style = (el.getAttribute("style") ?? "").toLowerCase();
    const weight = style.match(/font-weight:\s*(\w+)/)?.[1];
    const notBold = weight === "normal" || weight === "400";
    const bold = ((tag === "B" || tag === "STRONG") && !notBold) || weight === "bold" || Number(weight) >= 600;
    const italic = tag === "I" || tag === "EM" || /font-style:\s*italic/.test(style);
    if (tag === "A") {
      const href = el.getAttribute("href") ?? "";
      if (t.trim() && /^(https?:|mailto:|tel:|\/)/.test(href)) t = `[${t.trim()}](${href.replace(/[\s)]/g, "")})`;
    }
    if (italic) t = wrap("*", t);
    if (bold) t = wrap("**", t);
    return t;
  };

  // Vrai si l'élément contient un bloc, même enveloppé (Google Docs entoure
  // tout le contenu d'une balise <b> neutre, Word de <span>…).
  const BLOCK_SEL = Array.from(BLOCKS).join(",").toLowerCase();
  const hasBlockChild = (el: Element) => !!el.querySelector(BLOCK_SEL);
  const isBlockish = (n: Node) => n.nodeType === Node.ELEMENT_NODE && (BLOCKS.has((n as Element).tagName) || hasBlockChild(n as Element));
  const push = (prefix: string, text: string) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (t) out.push(prefix + t);
  };

  const walk = (el: Element, ctx: { list?: "ul" | "ol"; quote?: boolean }) => {
    const tag = el.tagName;
    if (tag === "STYLE" || tag === "SCRIPT" || tag === "HEAD") return;
    if (tag === "HR") { out.push("---"); return; }
    if (tag === "UL" || tag === "OL") {
      Array.from(el.children).forEach((c) => walk(c, { ...ctx, list: tag === "OL" ? "ol" : "ul" }));
      return;
    }
    if (tag === "BLOCKQUOTE") {
      if (hasBlockChild(el)) el.childNodes.forEach((c) => { if (isBlockish(c)) walk(c as Element, { ...ctx, quote: true }); else push("> ", inline(c)); });
      else push("> ", inline(el));
      return;
    }
    if (tag === "TR") {
      push("", Array.from(el.children).map((c) => inline(c).trim()).filter(Boolean).join(" — "));
      return;
    }
    if (/^H[1-6]$/.test(tag)) {
      // Dans un titre, le gras est implicite.
      push(tag === "H1" || tag === "H2" ? "## " : "### ", inline(el).replace(/\*\*/g, ""));
      return;
    }
    if (hasBlockChild(el)) {
      // Conteneur : texte direct éventuel, puis les blocs enfants.
      let buf = "";
      const flush = () => { if (buf.trim()) push(tag === "LI" ? (ctx.list === "ol" ? "1. " : "- ") : ctx.quote ? "> " : "", buf); buf = ""; };
      el.childNodes.forEach((n) => {
        if (isBlockish(n)) { flush(); walk(n as Element, ctx); }
        else buf += inline(n);
      });
      flush();
      return;
    }
    const text = inline(el);
    if (tag === "LI") push(ctx.list === "ol" ? "1. " : "- ", text);
    else if (ctx.quote) push("> ", text);
    else push("", text);
  };

  // Corps sans aucun bloc (simple fragment de texte mis en forme).
  if (!hasBlockChild(doc.body)) {
    push("", inline(doc.body));
  } else {
    let buf = "";
    const flush = () => { push("", buf); buf = ""; };
    doc.body.childNodes.forEach((n) => {
      if (isBlockish(n)) { flush(); walk(n as Element, {}); }
      else buf += inline(n);
    });
    flush();
  }

  // Lignes de liste consécutives sans ligne vide entre elles, le reste séparé.
  const lines: string[] = [];
  out.forEach((l, i) => {
    const prev = out[i - 1];
    const sameList = prev !== undefined && ((/^- /.test(l) && /^- /.test(prev)) || (/^1\. /.test(l) && /^1\. /.test(prev)));
    if (i > 0) lines.push(sameList ? "\n" : "\n\n");
    lines.push(l);
  });
  return lines.join("");
}
