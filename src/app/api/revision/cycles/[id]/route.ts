import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRevision } from "@/lib/permissions";

const UpdateSchema = z.object({
  isApplicable: z.boolean().optional(),
  commentCollaborator: z.string().optional().nullable(),
  conclusionCollaborator: z.string().optional().nullable(),
  status: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageRevision(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cycle = await prisma.revisionCycle.findUnique({ where: { id }, include: { dossier: true } });
  if (!cycle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cycle.dossier.lockedAt) return NextResponse.json({ error: "dossier_verrouille" }, { status: 409 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.revisionCycle.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
