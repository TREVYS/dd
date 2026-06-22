import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const QuestionUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  orderIndex: z.coerce.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = QuestionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const question = await prisma.quizQuestion.update({ where: { id }, data: parsed.data });
  return NextResponse.json(question);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.quizQuestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
