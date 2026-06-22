import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ACTION_PROMPTS: Record<string, string> = {
  summarize: "Résume cette leçon en quelques points clés, de façon claire et concise.",
  explain: "Explique cette leçon avec des mots simples, comme à un collaborateur junior, avec un exemple concret si possible.",
  memo: "Génère un mémo synthétique (titre, points clés, à retenir) à partir de cette leçon, prêt à être partagé.",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: lessonId } = await params;
  const { action, question } = (await req.json()) as { action?: string; question?: string };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { formation: { select: { title: true } } } } },
  });
  if (!lesson) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const lessonContext = `Formation : ${lesson.module.formation.title}\nModule : ${lesson.module.title}\nLeçon : ${lesson.title}\nType : ${lesson.type}\n\nContenu :\n${lesson.body ?? "(pas de contenu texte pour cette leçon)"}`;

  const instruction =
    action && ACTION_PROMPTS[action]
      ? ACTION_PROMPTS[action]
      : question?.trim()
        ? `Réponds à la question suivante du collaborateur à propos de cette leçon : ${question.trim()}`
        : "Résume cette leçon.";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      answer: "L'assistant IA n'est pas configuré (ANTHROPIC_API_KEY manquante).",
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const prompt = `Tu es l'assistant pédagogique de l'Academy interne d'un cabinet d'expertise comptable. Voici le contenu d'une leçon :\n\n${lessonContext}\n\n${instruction}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    return NextResponse.json({ answer: text || "Je n'ai pas pu générer de réponse." });
  } catch {
    return NextResponse.json({ answer: "Une erreur est survenue lors de la génération de la réponse IA." });
  }
}
