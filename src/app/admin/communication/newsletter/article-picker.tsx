"use client";

import { useMemo, useRef, useState } from "react";

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

// Sélecteur d'articles à diffuser : recherche par mots-clés, filtre par
// métier, et liste des articles choisis — réordonnable par glisser-déposer
// (ou boutons ↑/↓ au clavier/tactile) pour contrôler précisément l'ordre
// d'apparition dans l'e-mail. L'ordre de cette liste est ce qui part au
// serveur (name="slugs", répétés dans l'ordre choisi).
export function ArticlePicker({ posts }: { posts: PickPost[] }) {
  const [q, setQ] = useState("");
  const [metier, setMetier] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const byslug = useMemo(() => new Map(posts.map((p) => [p.slug, p])), [posts]);

  const terms = useMemo(
    () => q.toLowerCase().split(/\s+/).map((t) => t.trim()).filter(Boolean),
    [q],
  );

  function matches(p: PickPost): boolean {
    if (metier && p.metier !== metier) return false;
    if (terms.length === 0) return true;
    return terms.every((t) => p.search.includes(t));
  }

  const visibleCount = posts.filter(matches).length;

  function toggle(slug: string, checked: boolean) {
    setSelected((prev) => {
      if (checked) return prev.includes(slug) ? prev : [...prev, slug];
      return prev.filter((s) => s !== slug);
    });
  }

  function move(index: number, dir: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(slug: string) {
    setSelected((prev) => prev.filter((s) => s !== slug));
  }

  function onDrop(index: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null || from === index) return;
    setSelected((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  return (
    <div>
      {selected.map((slug) => (
        <input key={slug} type="hidden" name="slugs" value={slug} />
      ))}

      {selected.length > 0 && (
        <div className="ck-artorder">
          <div className="ck-artorder-h">
            <b>{selected.length}</b> article{selected.length > 1 ? "s" : ""} sélectionné{selected.length > 1 ? "s" : ""}
            <span className="muted"> — glissez pour réordonner, c&apos;est l&apos;ordre d&apos;envoi</span>
          </div>
          <ol className="ck-artorder-list">
            {selected.map((slug, i) => {
              const p = byslug.get(slug);
              if (!p) return null;
              return (
                <li
                  key={slug}
                  className={`ck-artorder-item${dragOver === i ? " over" : ""}`}
                  draggable
                  onDragStart={() => { dragFrom.current = i; }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                  onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
                  onDrop={(e) => { e.preventDefault(); onDrop(i); }}
                  onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
                >
                  <span className="ck-artorder-handle" aria-hidden="true">⠿</span>
                  <span className="ck-artorder-t">{p.title}</span>
                  <span className="ck-artorder-btns">
                    <button type="button" className="ck-artorder-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
                    <button type="button" className="ck-artorder-btn" onClick={() => move(i, 1)} disabled={i === selected.length - 1} aria-label="Descendre">↓</button>
                    <button type="button" className="ck-artorder-btn rm" onClick={() => remove(slug)} aria-label="Retirer">×</button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

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
            <input
              type="checkbox"
              checked={selected.includes(p.slug)}
              onChange={(e) => toggle(p.slug, e.target.checked)}
            />
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
