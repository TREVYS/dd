import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProgressSchema = z.object({
  lessonId: z.string().min(1),
  isCompleted: z.boolean().optional(),
  lastPositionSeconds: z.coerce.number().optional(),
  quizScore: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formationId = req.nextUrl.searchParams.get("formationId");
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      ...(formationId ? { lesson: { module: { formationId } } } : {}),
    },
  });
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { lessonId, isCompleted, lastPositionSeconds, quizScore } = parsed.data;
  const userId = session.user.id;

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      ...(isCompleted !== undefined ? { isCompleted, completedAt: isCompleted ? new Date() : null } : {}),
      ...(lastPositionSeconds !== undefined ? { lastPositionSeconds } : {}),
      ...(quizScore !== undefined ? { quizScore } : {}),
    },
    create: {
      userId,
      lessonId,
      isCompleted: isCompleted ?? false,
      lastPositionSeconds: lastPositionSeconds ?? 0,
      quizScore,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  if (isCompleted) {
    await maybeIssueCertificate(userId, lessonId);
  }

  return NextResponse.json(progress);
}

async function maybeIssueCertificate(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { formationId: true } } },
  });
  if (!lesson) return;
  const formationId = lesson.module.formationId;

  const lessons = await prisma.lesson.findMany({
    where: { module: { formationId } },
    select: { id: true },
  });
  if (lessons.length === 0) return;

  const completed = await prisma.lessonProgress.findMany({
    where: { userId, lessonId: { in: lessons.map((l) => l.id) }, isCompleted: true },
    select: { lessonId: true, quizScore: true },
  });
  if (completed.length < lessons.length) return;

  const scores = completed.map((c) => c.quizScore).filter((s): s is number => s !== null);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  await prisma.formationProgress.upsert({
    where: { userId_formationId: { userId, formationId } },
    update: { status: "completed", score: avgScore ?? undefined, completedAt: new Date() },
    create: { userId, formationId, status: "completed", score: avgScore, completedAt: new Date() },
  });

  await prisma.certificate.upsert({
    where: { userId_formationId: { userId, formationId } },
    update: {},
    create: { userId, formationId, score: avgScore },
  });
}
