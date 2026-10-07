import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsEn } from "@/lib/blog-en";

export const metadata: Metadata = {
  title: "Insights",
  description: "Analysis and insights from Trevys Advisory — accounting, tax, e-invoicing reform, and AI in finance.",
  alternates: { canonical: "/en/blog" },
};

export default function EnBlogIndex() {
  const posts = getAllPostsEn();
  return (
    <section className="sec">
      <div className="wrap">
        <div className="shead">
          <span className="eyebrow">Insights</span>
          <h2>Articles translated <em>from our French blog</em></h2>
          {posts.length === 0 && (
            <p>English translations are published progressively, right after their French original. Check back soon.</p>
          )}
        </div>
        <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {posts.map((p) => (
            <Link key={p.slug} href={`/en/blog/${p.slug}`} className="mkt-svc" style={{ textDecoration: "none" }}>
              <h3 style={{ fontSize: "1.1rem" }}>{p.title}</h3>
              <p>{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
