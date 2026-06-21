import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewArticleButton, CATEGORIES } from "./new-article-button";
import { ArticleList } from "./article-list";
import { AiAssistantPanel } from "./ai-assistant-panel";

export default async function KnowledgeCabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const isPartner = session?.user?.role === "Associé";

  const articles = await prisma.knowledgeArticle.findMany({
    where: { category: sp.category || undefined },
    include: { creator: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Knowledge Cabinet</h1>
        <NewArticleButton />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-4">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/knowledge-cabinet"
              className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                !sp.category ? "bg-brand text-white" : "bg-white text-gray-500"
              }`}
            >
              Toutes
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/knowledge-cabinet?category=${encodeURIComponent(c)}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                  sp.category === c ? "bg-brand text-white" : "bg-white text-gray-500"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>

          <ArticleList
            isPartner={isPartner}
            articles={articles.map((a) => ({
              id: a.id,
              title: a.title,
              category: a.category,
              content: a.content,
              status: a.status,
              creatorName: a.creator ? `${a.creator.firstName} ${a.creator.lastName}` : null,
            }))}
          />
        </div>

        <AiAssistantPanel />
      </div>
    </div>
  );
}
