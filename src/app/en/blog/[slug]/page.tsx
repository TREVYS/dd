import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostEn, getAllPostsEn } from "@/lib/blog-en";
import { SITE_URL } from "@/lib/site";
import { ArticleLangLink } from "../../../(marketing)/blog/[slug]/article-lang";

export function generateStaticParams() {
  return getAllPostsEn().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostEn(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.excerpt,
    alternates: {
      canonical: `/en/blog/${slug}`,
      languages: { fr: `${SITE_URL}/blog/${slug}` },
    },
  };
}

export default async function EnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostEn(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    description: post.meta.excerpt,
    datePublished: post.meta.date,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Trevys Advisory" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/en/blog/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mkt-arthead">
        <div className="wrap">
          <nav className="mkt-artcrumb" aria-label="Breadcrumb">
            <Link href="/en">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/en/blog">Insights</Link>
          </nav>
          <h1>{post.meta.title}</h1>
          <p style={{ marginTop: ".6rem", color: "var(--ink3)", fontSize: ".85rem" }}>
            Also available in{" "}
            <ArticleLangLink href={`/blog/${slug}`}>French</ArticleLangLink>.
          </p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1.5rem" }}>
        <div className="wrap">
          <article className="mkt-article" style={{ maxWidth: 760, margin: "0 auto" }}>
            <MDXRemote source={post.content} />
          </article>
          <div style={{ marginTop: "3rem", maxWidth: 760, margin: "3rem auto 0" }}>
            <Link className="btn btn-ghost" href="/en/blog">← All insights</Link>
          </div>
        </div>
      </section>
    </>
  );
}
