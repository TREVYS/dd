"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/blog";

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

export function BlogList({ posts }: { posts: PostMeta[] }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return ["Tous", ...Array.from(set)];
  }, [posts]);

  const [active, setActive] = useState("Tous");

  const filtered = useMemo(
    () => (active === "Tous" ? posts : posts.filter((p) => p.category === active)),
    [active, posts],
  );

  return (
    <>
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

      <div className="mkt-blog-grid">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="mkt-postcard">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="thumb" src={p.image} alt={p.title} loading="lazy" />
            ) : (
              <div className="thumb" />
            )}
            <div className="body">
              <span className="cat">{p.category}</span>
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
              <div className="meta">
                {formatDateFr(p.date)}
                <span className="lire">Lire l&apos;article →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "var(--ink2)", marginTop: "1.5rem" }}>
          Aucun article dans ce thème pour le moment.
        </p>
      )}
    </>
  );
}
