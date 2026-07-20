// Rendu Markdown léger pour l'aperçu du back-office (titres, listes, gras,
// liens, images, citations). Volontairement simple : le rendu final du site
// passe par MDX, ceci n'est qu'une prévisualisation.
function inline(t: string): string {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function mdToHtml(md: string): string {
  const lines = (md || "").split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  for (const raw of lines) {
    const l = raw.replace(/\s+$/, "");
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^#{4,6}\s+(.*)$/)) || (m = l.match(/^###\s+(.*)$/))) {
      closeList();
      out.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = l.match(/^##\s+(.*)$/))) {
      closeList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = l.match(/^#\s+(.*)$/))) {
      closeList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = l.match(/^>\s+(.*)$/))) {
      closeList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = l.match(/^\s*[-*]\s+(.*)$/))) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(m[1])}</li>`);
    } else if (l.trim() === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(l)}</p>`);
    }
  }
  closeList();
  return out.join("");
}
