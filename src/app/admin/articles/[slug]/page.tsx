import { notFound } from "next/navigation";
import { getRawArticle } from "@/lib/content-admin";
import { ArticleForm } from "../article-form";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getRawArticle(slug);
  if (!article) notFound();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Modifier l&apos;article</h1>
          <p>/blog/{slug}</p>
        </div>
      </div>
      <ArticleForm article={article} />
    </>
  );
}
