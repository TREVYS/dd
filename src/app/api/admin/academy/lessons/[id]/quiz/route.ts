import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const QuestionSchema = z.object({
  question: z.string().min(1),
  orderIndex: z.coerce.number().optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean().optional(),
        orderIndex: z.coerce.number().optional(),
      })
    )
    .min(2),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: lessonId } = await params;
  const body = await req.json();
  const parsed = QuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { question, orderIndex, options } = parsed.data;
  const created = await prisma.quizQuestion.create({
    data: {
      lessonId,
      question,
      orderIndex: orderIndex ?? 0,
      options: {
        create: options.map((o, i) => ({
          text: o.text,
          isCorrect: o.isCorrect ?? false,
          orderIndex: o.orderIndex ?? i,
        })),
      },
    },
    include: { options: true },
  });
  return NextResponse.json(created, { status: 201 });
}
