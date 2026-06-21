import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const ParcoursUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  formationIds: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ParcoursUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { formationIds, ...rest } = parsed.data;

  if (formationIds) {
    await prisma.parcoursFormation.deleteMany({ where: { parcoursId: id } });
    await prisma.parcoursFormation.createMany({
      data: formationIds.map((formationId, i) => ({ parcoursId: id, formationId, orderIndex: i })),
    });
  }

  const parcours = await prisma.parcours.update({ where: { id }, data: rest });
  return NextResponse.json(parcours);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.parcours.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
