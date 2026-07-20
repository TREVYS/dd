import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPage, listPages } from "@/lib/content-admin";

export function generateStaticParams() {
  return listPages().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};
  return {
    title: page.meta.title,
    description: page.meta.description || undefined,
    alternates: { canonical: `/p/${slug}` },
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in" style={{ maxWidth: "820px" }}>
          <span className="eyebrow">Trevys</span>
          <h1 style={{ textTransform: "none" }}>{page.meta.title}</h1>
        </div>
      </header>
      <section className="sec" style={{ paddingTop: "1rem" }}>
        <div className="wrap" style={{ maxWidth: "820px" }}>
          <article className="mkt-article">
            <MDXRemote source={page.body} />
          </article>
        </div>
      </section>
    </>
  );
}
