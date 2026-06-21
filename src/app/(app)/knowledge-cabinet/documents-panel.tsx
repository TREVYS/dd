"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, BookOpen, Search } from "lucide-react";
import type { Exchange } from "./ai-assistant-panel";
import { ArticleList } from "./article-list";
import { CATEGORIES } from "@/lib/knowledge-categories";

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  status: string;
  creatorName: string | null;
};

export function DocumentsPanel({
  latestExchange,
  articles,
  isPartner,
}: {
  latestExchange: Exchange | null;
  articles: Article[];
  isPartner: boolean;
}) {
  const [tab, setTab] = useState<"trouves" | "bibliotheque">("trouves");
  const [category, setCategory] = useState<string | null>(null);

  const filteredArticles = category ? articles.filter((a) => a.category === category) : articles;

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col h-full">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab("trouves")}
          className={`flex-1 text-xs font-medium rounded-xl px-3 py-2 ${
            tab === "trouves" ? "bg-brand text-white" : "bg-gray-50 text-gray-500"
          }`}
        >
          Documents trouvés
        </button>
        <button
          onClick={() => setTab("bibliotheque")}
          className={`flex-1 text-xs font-medium rounded-xl px-3 py-2 ${
            tab === "bibliotheque" ? "bg-brand text-white" : "bg-gray-50 text-gray-500"
          }`}
        >
          Bibliothèque
        </button>
      </div>

      {tab === "trouves" ? (
        <div className="flex-1 overflow-y-auto space-y-4">
          {!latestExchange ? (
            <div className="text-xs text-gray-400 flex flex-col items-center gap-2 py-10 text-center">
              <Search size={20} className="text-gray-300" />
              Posez une question dans le dialogue pour voir apparaître ici les articles de la documentation
              du cabinet et les documents de la GED associés.
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  <BookOpen size={13} /> Documentation interne
                </p>
                {latestExchange.sources.length === 0 ? (
                  <p className="text-xs text-gray-400">Aucun article trouvé.</p>
                ) : (
                  <div className="space-y-2">
                    {latestExchange.sources.map((s) => (
                      <div key={s.id} className="rounded-xl bg-gray-50 px-3 py-2 text-xs flex items-center gap-2">
                        <FileText size={13} className="text-brand shrink-0" />
                        <span className="truncate">{s.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                  <FolderOpen size={13} /> Documents GED
                </p>
                {latestExchange.docSources.length === 0 ? (
                  <p className="text-xs text-gray-400">Aucun document GED trouvé.</p>
                ) : (
                  <div className="space-y-2">
                    {latestExchange.docSources.map((d) => (
                      <Link
                        key={d.id}
                        href={`/ged${d.clientId ? `?client=${d.clientId}&q=${encodeURIComponent(d.name)}` : ""}`}
                        className="rounded-xl bg-gray-50 hover:bg-gray-100 px-3 py-2 text-xs flex items-center gap-2 block"
                      >
                        <FileText size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate flex-1">{d.name}</span>
                        {d.clientName && <span className="text-gray-400 shrink-0">{d.clientName}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory(null)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                !category ? "bg-brand text-white" : "bg-gray-50 text-gray-500"
              }`}
            >
              Toutes
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  category === c ? "bg-brand text-white" : "bg-gray-50 text-gray-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <ArticleList articles={filteredArticles} isPartner={isPartner} compact />
        </div>
      )}
    </div>
  );
}
