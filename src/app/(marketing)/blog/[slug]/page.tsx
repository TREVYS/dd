import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getPostSlugs, formatDateFr } from "@/lib/blog";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    description: post.meta.excerpt,
    datePublished: post.meta.date,
    author: { "@type": "Organization", name: post.meta.author ?? "Trevys" },
    publisher: { "@type": "Organization", name: "Trevys Advisory" },
    mainEntityOfPage: `https://www.trevys-advisory.fr/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mkt-phead">
        <div className="mkt-phead-in" style={{ maxWidth: "780px" }}>
          <span className="eyebrow">{post.meta.category}</span>
          <h1 style={{ textTransform: "none" }}>{post.meta.title}</h1>
          <p>
            {formatDateFr(post.meta.date)} · {post.meta.author ?? "Trevys"} ·{" "}
            {readingMinutes(post.content)} min de lecture
          </p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: "780px" }}>
          {post.meta.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="mkt-article-hero"
              src={post.meta.image}
              alt=""
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
      </section>
    </>
  );
}
