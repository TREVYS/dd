import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const LessonUpdateSchema = z.object({
  type: z.enum(["video", "text", "pdf", "checklist", "quiz", "case_study", "webinar"]).optional(),
  title: z.string().min(1).optional(),
  body: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  durationMinutes: z.coerce.number().nullable().optional(),
  orderIndex: z.coerce.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = LessonUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lesson = await prisma.lesson.update({ where: { id }, data: parsed.data });
  return NextResponse.json(lesson);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
