"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

const PAGE_SIZE = 10;

function formatDateFr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[̀-ͯ]", "g"), "");
}

function Card({ p, featured }: { p: PostMeta; featured?: boolean }) {
  return (
    <Link href={`/blog/${p.slug}`} className={`mkt-artcard${featured ? " feat" : ""}`}>
      <div className="ac-body">
        <span className="ac-cat">{p.category}</span>
        <h3 className="ac-title">{p.title}</h3>
        <p className="ac-syn">{p.excerpt}</p>
        <div className="ac-meta">
          <span>{formatDateFr(p.date)}</span>
          {p.readingTime ? <span>· {p.readingTime} min de lecture</span> : null}
          <span className="ac-lire">Lire l&apos;article →</span>
        </div>
      </div>
      <div className="ac-media">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} loading="lazy" />
        ) : (
          <div className="ac-ph" aria-hidden="true" />
        )}
      </div>
    </Link>
  );
}

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return ["Tous", ...Array.from(set)];
  }, [posts]);

  const [active, setActive] = useState("Tous");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Réinitialiser la pagination quand le filtre ou la recherche change.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [active, query]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return posts.filter((p) => {
      if (active !== "Tous" && p.category !== active) return false;
      if (!q) return true;
      return normalize(`${p.title} ${p.excerpt} ${p.category}`).includes(q);
    });
  }, [active, query, posts]);

  const shown = filtered.slice(0, visible);

  return (
    <>
      <div className="mkt-blog-toolbar">
        <div className="mkt-filters" role="tablist" aria-label="Filtrer par thème">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active === c}
              className={`mkt-filter${active === c ? " on" : ""}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mkt-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
            aria-label="Rechercher un article"
          />
        </div>
      </div>

      <div className="mkt-artlist">
        {shown.map((p, i) => (
          <Card key={p.slug} p={p} featured={i === 0 && active === "Tous" && !query} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--ink2)", marginTop: "1.5rem" }}>
          Aucun article ne correspond à votre recherche.
        </p>
      )}

      {visible < filtered.length && (
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Voir plus d&apos;articles ({filtered.length - visible})
          </button>
        </div>
      )}
    </>
  );
}
