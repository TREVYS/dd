import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDateFr } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Analyses, guides et décryptages de Trevys sur la facturation électronique, la fiscalité, la comptabilité et l'innovation.",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  const posts = getAllPosts();
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Le journal</span>
          <h1>Nous <em>décryptons</em> l&apos;actu du chiffre et de la réforme</h1>
          <p>
            Analyses, guides pratiques et décryptages de nos équipes sur la
            facturation électronique, la fiscalité, la comptabilité et
            l&apos;innovation.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: "1.6rem",
            }}
          >
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="mkt-postcard"
              >
                <div className="thumb" />
                <div className="body">
                  <span className="cat">{p.category}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="meta">{formatDateFr(p.date)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
