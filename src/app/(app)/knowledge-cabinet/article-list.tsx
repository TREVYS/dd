"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { ArticleDetailModal } from "./article-detail-modal";

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  status: string;
  creatorName: string | null;
};

export function ArticleList({ articles, isPartner }: { articles: Article[]; isPartner: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = articles.find((a) => a.id === activeId) ?? null;

  if (articles.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">Aucun article dans cette catégorie.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {articles.map((a) => (
        <button
          key={a.id}
          onClick={() => setActiveId(a.id)}
          className="text-left glass-panel rounded-2xl p-4 hover:shadow-md transition space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-brand bg-brand/10 rounded-full px-2 py-0.5">
              {a.category ?? "Non classé"}
            </span>
            {a.status !== "validee" && (
              <span className="text-[10px] font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                Brouillon
              </span>
            )}
          </div>
          <p className="font-medium text-sm flex items-center gap-1.5">
            <FileText size={14} className="text-gray-400" />
            {a.title}
          </p>
          <p className="text-xs text-gray-400 line-clamp-2">{a.content}</p>
        </button>
      ))}

      {active && (
        <ArticleDetailModal article={active} isPartner={isPartner} onClose={() => setActiveId(null)} />
      )}
    </div>
  );
}
