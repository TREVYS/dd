import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getPostSlugs, getAllPosts, formatDateFr } from "@/lib/blog";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.excerpt,
      url: `/blog/${slug}`,
      images: post.meta.image ? [post.meta.image] : undefined,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const minutes = readingMinutes(post.content);
  const related = getAllPosts()
    .filter((p) => p.slug !== slug && p.category === post.meta.category)
    .slice(0, 3);

  const SITE = "https://www.trevys-advisory.fr";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.meta.title,
        description: post.meta.excerpt,
        datePublished: post.meta.date,
        dateModified: post.meta.date,
        image: post.meta.image ? [post.meta.image] : undefined,
        articleSection: post.meta.category,
        inLanguage: "fr-FR",
        author: { "@type": "Organization", name: post.meta.author ?? "Trevys" },
        publisher: { "@id": `${SITE}/#organization` },
        mainEntityOfPage: `${SITE}/blog/${slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE },
          { "@type": "ListItem", position: 2, name: "Ressources", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: post.meta.title },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mkt-arthead">
        <div className="wrap">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog">Ressources</Link>
            <span aria-hidden="true">/</span>
            <span>{post.meta.category}</span>
          </nav>
          <span className="eyebrow">{post.meta.category}</span>
          <h1>{post.meta.title}</h1>
          <div className="mkt-artmeta">
            <span>{formatDateFr(post.meta.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.meta.author ?? "Trevys"}</span>
            <span aria-hidden="true">·</span>
            <span>{minutes} min de lecture</span>
          </div>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1.5rem" }}>
        <div className="wrap mkt-artview">
          <div className="mkt-artmain">
            {post.meta.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="mkt-article-hero"
                src={post.meta.image}
                alt={post.meta.title}
                loading="lazy"
              />
            )}
            <article className="mkt-article">
              <MDXRemote source={post.content} />
            </article>
            <div style={{ marginTop: "3rem" }}>
              <Link className="btn btn-ghost" href="/blog">
                ← Tous les articles
              </Link>
            </div>
          </div>

          <aside className="mkt-artside">
            <div className="mkt-artside-in">
              {post.meta.excerpt && (
                <div className="mkt-artsum">
                  <span className="mkt-artsum-lbl">En bref</span>
                  <p>{post.meta.excerpt}</p>
                </div>
              )}

              <dl className="mkt-artfacts">
                <div>
                  <dt>Thème</dt>
                  <dd>{post.meta.category}</dd>
                </div>
                <div>
                  <dt>Lecture</dt>
                  <dd>{minutes} min</dd>
                </div>
                <div>
                  <dt>Publié le</dt>
                  <dd>{formatDateFr(post.meta.date)}</dd>
                </div>
                <div>
                  <dt>Auteur</dt>
                  <dd>{post.meta.author ?? "Trevys"}</dd>
                </div>
              </dl>

              <div className="mkt-artcta">
                <p>Une question sur ce sujet ?</p>
                <Link className="btn btn-gold" href="/rendez-vous">
                  Prendre rendez-vous
                </Link>
              </div>

              {related.length > 0 && (
                <div className="mkt-artrel">
                  <span className="mkt-artsum-lbl">À lire aussi</span>
                  <ul>
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link href={`/blog/${r.slug}`}>{r.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
