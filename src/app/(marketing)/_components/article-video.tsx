// Vidéo YouTube intégrée dans le corps d'un article (rendu MDX).
// Usage dans le Markdown : <YouTube id="1-l-g7ElQq8" />
export function ArticleVideo({ id, title }: { id?: string; title?: string }) {
  const safe = (id ?? "").match(/[A-Za-z0-9_-]{11}/)?.[0];
  if (!safe) return null;
  return (
    <span className="mkt-article-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${safe}?rel=0`}
        title={title ?? "Vidéo"}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </span>
  );
}
