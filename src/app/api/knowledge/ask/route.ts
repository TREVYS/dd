import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchKnowledge, askKnowledgeAI } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { question, useWeb } = (await req.json()) as { question?: string; useWeb?: boolean };
  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const matches = await searchKnowledge(question);
  const { answer, source, webResults } = await askKnowledgeAI(question, matches, !!useWeb);

  return NextResponse.json({
    answer,
    source,
    sources: matches.map((m) => ({ id: m.id, title: m.title })),
    webSources: webResults.map((w) => ({ title: w.title, url: w.url })),
  });
}
