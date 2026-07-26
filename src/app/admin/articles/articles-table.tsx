"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bulkArticlesAction } from "../actions";

export type ArticleRow = {
  slug: string;
  title: string;
  category: string;
  dateLabel: string;
  image?: string;
  search: string; // titre + thème + résumé, en minuscules
};

// Liste des articles : recherche par mots-clés, sélection multiple et actions
// groupées (dépublier → retour en brouillon, ou supprimer).
export function ArticlesTable({ posts }: { posts: ArticleRow[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());

  const terms = useMemo(
    () => q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean),
    [q],
  );
  const visible = posts.filter((p) => terms.every((t) => p.search.includes(t)));
  const allVisibleSelected = visible.length > 0 && visible.every((p) => sel.has(p.slug));

  const toggle = (slug: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  const toggleAll = () =>
    setSel((s) => {
      const n = new Set(s);
      if (allVisibleSelected) visible.forEach((p) => n.delete(p.slug));
      else visible.forEach((p) => n.add(p.slug));
      return n;
    });

  return (
    <form action={bulkArticlesAction}>
      {/* Recherche */}
      <div className="ck-artsearch" style={{ margin: "0 0 .9rem", maxWidth: 520 }}>
        <svg viewBox="0 0 24 24"><path d="M21 21l-4-4M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrer par mot-clé : titre, thème, résumé…"
          aria-label="Rechercher un article"
        />
        {q && (
          <button type="button" className="ck-artsearch-clear" onClick={() => setQ("")} aria-label="Effacer">×</button>
        )}
      </div>

      {/* Barre d'actions groupées */}
      {sel.size > 0 && (
        <div
          className="adm-note"
          style={{ marginBottom: ".9rem", display: "flex", alignItems: "center", gap: ".7rem", flexWrap: "wrap" }}
        >
          <b>{sel.size} article{sel.size > 1 ? "s" : ""} sélectionné{sel.size > 1 ? "s" : ""}</b>
          <button className="adm-btn ghost sm" type="submit" name="op" value="unpublish">
            Dépublier (→ brouillons)
          </button>
          <button
            className="adm-btn danger sm"
            type="submit"
            name="op"
            value="delete"
            onClick={(e) => {
              if (!confirm(`Supprimer définitivement ${sel.size} article(s) ? Cette action est irréversible.`)) {
                e.preventDefault();
              }
            }}
          >
            Supprimer définitivement
          </button>
          <button type="button" className="adm-btn ghost sm" onClick={() => setSel(new Set())}>
            Annuler la sélection
          </button>
        </div>
      )}

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 40, paddingLeft: "1.1rem" }}>
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Tout sélectionner" />
              </th>
              <th style={{ width: 72 }}></th>
              <th>Titre</th>
              <th>Thème</th>
              <th>Date</th>
              <th style={{ textAlign: "right", paddingRight: "1.1rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.slug} style={sel.has(p.slug) ? { background: "var(--o-tint)" } : undefined}>
                <td style={{ paddingLeft: "1.1rem" }}>
                  <input
                    type="checkbox"
                    name="slugs"
                    value={p.slug}
                    checked={sel.has(p.slug)}
                    onChange={() => toggle(p.slug)}
                    aria-label={`Sélectionner ${p.title}`}
                  />
                </td>
                <td style={{ padding: ".6rem .5rem" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image ? <img className="adm-thumb" src={p.image} alt="" /> : <span className="adm-thumb" />}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div className="muted">/blog/{p.slug}</div>
                </td>
                <td><span className="adm-tag">{p.category}</span></td>
                <td className="muted">{p.dateLabel}</td>
                <td style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                  <Link className="adm-btn ghost sm" href={`/admin/articles/${p.slug}`}>Modifier</Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ padding: "1.4rem" }}>
                  {posts.length === 0 ? "Aucun article." : `Aucun article ne correspond à « ${q} ».`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </form>
  );
}
