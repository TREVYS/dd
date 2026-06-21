"use client";

import { useState } from "react";
import { AiAssistantPanel, type Exchange } from "./ai-assistant-panel";
import { DocumentsPanel } from "./documents-panel";

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  status: string;
  creatorName: string | null;
};

export function KnowledgeWorkspace({ articles, isPartner }: { articles: Article[]; isPartner: boolean }) {
  const [latestExchange, setLatestExchange] = useState<Exchange | null>(null);

  return (
    <div className="grid grid-cols-[1fr_380px] gap-4 h-[calc(100vh-220px)]">
      <AiAssistantPanel onExchange={setLatestExchange} />
      <DocumentsPanel latestExchange={latestExchange} articles={articles} isPartner={isPartner} />
    </div>
  );
}
