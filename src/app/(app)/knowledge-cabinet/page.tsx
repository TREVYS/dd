import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewArticleButton } from "./new-article-button";
import { KnowledgeWorkspace } from "./knowledge-workspace";

export default async function KnowledgeCabinetPage() {
  const session = await auth();
  const isPartner = session?.user?.role === "Associé";

  const articles = await prisma.knowledgeArticle.findMany({
    include: { creator: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Cabinet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Dialoguez avec l&apos;assistant pour retrouver une réponse dans la documentation interne validée ou les
            documents de la GED des clients.
          </p>
        </div>
        <NewArticleButton />
      </div>

      <KnowledgeWorkspace
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
  );
}
