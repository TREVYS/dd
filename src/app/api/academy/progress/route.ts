import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProgressSchema = z.object({
  formationId: z.string().min(1),
  status: z.enum(["not_started", "in_progress", "completed"]),
  score: z.coerce.number().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const progress = await prisma.formationProgress.findMany({
    where: { userId: session.user.id },
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

  const { formationId, status, score } = parsed.data;
  const progress = await prisma.formationProgress.upsert({
    where: { userId_formationId: { userId: session.user.id, formationId } },
    update: { status, score, completedAt: status === "completed" ? new Date() : null },
    create: {
      userId: session.user.id,
      formationId,
      status,
      score,
      completedAt: status === "completed" ? new Date() : null,
    },
  });
  return NextResponse.json(progress);
}
