import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalPageView } from "../../_components/local-page-view";
import { getLocalPage, localPagesOf } from "@/lib/local-pages";

const FAMILLE = "expert-comptable" as const;

export function generateStaticParams() {
  return localPagesOf(FAMILLE).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLocalPage(FAMILLE, slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${FAMILLE}/${page.slug}` },
    openGraph: { title: page.title, description: page.description, type: "website" },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLocalPage(FAMILLE, slug);
  if (!page) notFound();
  return <LocalPageView page={page} />;
}
