import { notFound } from "next/navigation";
import { getRawArticle } from "@/lib/content-admin";
import { getPostEn } from "@/lib/blog-en";
import { ArticleForm } from "../article-form";

export const dynamic = "force-dynamic";

export default async function EditArticle({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const article = getRawArticle(slug);
  if (!article) notFound();
  const translation = getPostEn(slug);
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Modifier l&apos;article</h1>
          <p>/blog/{slug}</p>
        </div>
      </div>
      <ArticleForm
        article={article}
        translation={translation ? { title: translation.meta.title, excerpt: translation.meta.excerpt, body: translation.content } : null}
        translateError={error === "translate"}
      />
    </>
  );
}
