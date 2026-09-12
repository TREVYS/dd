"use client";

import { useMemo, useState } from "react";

export type PickPost = {
  slug: string;
  title: string;
  category: string;
  metier: string; // "Consulting" | "Expertise comptable"
  dateLabel: string;
  search: string; // titre + résumé + contenu, en minuscules
  mailSent?: { count: number; lastSentAt: string };
};

const METIERS = ["Consulting", "Expertise comptable", "Transverse"] as const;

// Sélecteur d'articles à diffuser : recherche par mots-clés (titre + contenu)
// et filtre par métier (Consulting / Expertise comptable). Les cases restent
// montées (masquées en CSS) pour ne pas perdre les articles déjà cochés.
export function ArticlePicker({ posts }: { posts: PickPost[] }) {
  const [q, setQ] = useState("");
  const [metier, setMetier] = useState<string>("");

  const terms = useMemo(
    () => q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean),
    [q],
  );

  function matches(p: PickPost): boolean {
    if (metier && p.metier !== metier) return false;
    if (terms.length === 0) return true;
    // Tous les mots-clés doivent être présents (titre + contenu).
    return terms.every((t) => p.search.includes(t));
  }

  const visibleCount = posts.filter(matches).length;

  return (
    <div>
      <div className="ck-artsearch">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 21l-4-4M11 18a7 7 0 100-14 7 7 0 000 14z" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un article (titre ou contenu)…"
          aria-label="Rechercher un article par mots-clés"
        />
        {q && (
          <button type="button" className="ck-artsearch-clear" onClick={() => setQ("")} aria-label="Effacer la recherche">
            ×
          </button>
        )}
      </div>

      <div className="ck-metier-chips" role="group" aria-label="Filtrer par métier">
        <button
          type="button"
          className={`ck-chip${metier === "" ? " on" : ""}`}
          onClick={() => setMetier("")}
        >
          Tous
        </button>
        {METIERS.map((m) => (
          <button
            key={m}
            type="button"
            className={`ck-chip${metier === m ? " on" : ""}`}
            data-metier={m}
            onClick={() => setMetier(metier === m ? "" : m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="ck-artpick">
        {posts.map((p) => (
          <label
            key={p.slug}
            className="ck-artpick-item"
            style={matches(p) ? undefined : { display: "none" }}
          >
            <input type="checkbox" name="slugs" value={p.slug} />
            <span className="ck-artpick-body">
              <span className="t">{p.title}</span>
              <span className="m">
                <span className="adm-tag ck-tag-metier" data-metier={p.metier}>{p.metier}</span>{" "}
                <span className="adm-tag">{p.category}</span> {p.dateLabel}
                {p.mailSent && (
                  <span
                    className="adm-tag"
                    style={{ background: "#eaf6ee", color: "#2E9E6B", borderColor: "#bfe3c9", marginLeft: ".35rem" }}
                    title={`Déjà envoyé ${p.mailSent.count} fois — dernier envoi le ${new Date(p.mailSent.lastSentAt).toLocaleDateString("fr-FR")}`}
                  >
                    ✓ déjà envoyé
                  </span>
                )}
              </span>
            </span>
          </label>
        ))}
        {posts.length === 0 && <p className="muted">Aucun article publié pour l&apos;instant.</p>}
        {posts.length > 0 && visibleCount === 0 && (
          <p className="muted" style={{ padding: ".4rem 0" }}>
            Aucun article ne correspond{metier ? ` (${metier})` : ""}{q ? ` à « ${q} »` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
