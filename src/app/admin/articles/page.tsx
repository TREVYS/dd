import Link from "next/link";
import { getAllPosts, formatDateFr } from "@/lib/blog";
import { listUploads } from "@/lib/media";
import { ArticlesTable, type ArticleRow } from "./articles-table";

export const dynamic = "force-dynamic";

export default async function AdminArticles({
  searchParams,
}: {
  searchParams: Promise<{ bulk?: string; n?: string }>;
}) {
  const sp = await searchParams;
  const posts: ArticleRow[] = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    dateLabel: formatDateFr(p.date),
    image: p.image,
    search: `${p.title} ${p.category} ${p.excerpt ?? ""} ${p.slug}`.toLowerCase(),
  }));

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Articles</h1>
          <p>{posts.length} article{posts.length > 1 ? "s" : ""} · gérez vos ressources.</p>
        </div>
        <Link className="adm-btn" href="/admin/articles/new">+ Nouvel article</Link>
      </div>

      {sp.bulk === "delete" && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          {sp.n} article{Number(sp.n) > 1 ? "s" : ""} supprimé{Number(sp.n) > 1 ? "s" : ""}.
        </div>
      )}
      {sp.bulk === "unpublish" && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          {sp.n} article{Number(sp.n) > 1 ? "s" : ""} dépublié{Number(sp.n) > 1 ? "s" : ""} — à retrouver dans les{" "}
          <Link href="/admin/communication/calendrier" className="adm-link">Brouillons</Link>.
        </div>
      )}
      {sp.bulk === "category" && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          Thème modifié sur {sp.n} article{Number(sp.n) > 1 ? "s" : ""}.
        </div>
      )}
      {sp.bulk === "image" && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          Image de couverture modifiée sur {sp.n} article{Number(sp.n) > 1 ? "s" : ""}.
        </div>
      )}

      <ArticlesTable
        posts={posts}
        images={listUploads()
          .filter((m) => /\.(png|jpe?g|webp|gif|svg)$/i.test(m.url))
          .map((m) => m.url)}
      />
    </>
  );
}
