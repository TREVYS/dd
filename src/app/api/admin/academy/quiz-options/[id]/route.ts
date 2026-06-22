import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const OptionUpdateSchema = z.object({
  text: z.string().min(1).optional(),
  isCorrect: z.boolean().optional(),
  orderIndex: z.coerce.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = OptionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const option = await prisma.quizOption.update({ where: { id }, data: parsed.data });
  return NextResponse.json(option);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.quizOption.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
