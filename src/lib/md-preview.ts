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
  // Aperçu des vidéos : <YouTube id="…" /> → vignette cliquable.
  const withVideos = (md || "").replace(
    /<YouTube\s+id=["']([A-Za-z0-9_-]{11})["']\s*\/>/g,
    (_m, id) =>
      `\n\n<div class="mkt-article-video" style="background:#000"><a href="https://youtu.be/${id}" target="_blank" rel="noopener"><img alt="Vidéo YouTube" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;display:block;opacity:.85" /></a></div>\n\n`,
  );
  const lines = withVideos.split(/\r?\n/);
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
    } else if (/^\s*<(div|iframe|img|figure)\b/.test(l)) {
      // Bloc HTML brut (ex. vignette vidéo) : on le laisse passer tel quel.
      closeList();
      out.push(l);
    } else {
      closeList();
      out.push(`<p>${inline(l)}</p>`);
    }
  }
  closeList();
  return out.join("");
}
