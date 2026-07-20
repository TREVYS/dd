import Link from "next/link";
import { getAllPosts, formatDateFr } from "@/lib/blog";
import { deleteArticleAction } from "../actions";

export const dynamic = "force-dynamic";

export default function AdminArticles() {
  const posts = getAllPosts();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Articles</h1>
          <p>{posts.length} article{posts.length > 1 ? "s" : ""} · gérez vos ressources.</p>
        </div>
        <Link className="adm-btn" href="/admin/articles/new">+ Nouvel article</Link>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}></th>
              <th>Titre</th>
              <th>Thème</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td style={{ padding: ".6rem .5rem .6rem 1.2rem" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image ? <img className="adm-thumb" src={p.image} alt="" /> : <span className="adm-thumb" />}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div className="muted">/blog/{p.slug}</div>
                </td>
                <td><span className="adm-tag">{p.category}</span></td>
                <td className="muted">{formatDateFr(p.date)}</td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end" }}>
                    <Link className="adm-btn ghost sm" href={`/admin/articles/${p.slug}`}>Modifier</Link>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="slug" value={p.slug} />
                      <button className="adm-btn danger sm" type="submit">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ padding: "1.4rem" }}>Aucun article.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
