import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const FormationUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  durationMinutes: z.coerce.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = FormationUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const formation = await prisma.formation.update({ where: { id }, data: parsed.data });
  return NextResponse.json(formation);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.formation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
