import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRevision } from "@/lib/permissions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageRevision(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cycle = await prisma.revisionCycle.findUnique({ where: { id }, include: { dossier: true } });
  if (!cycle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cycle.dossier.lockedAt) return NextResponse.json({ error: "dossier_verrouille" }, { status: 409 });
  if (!cycle.conclusionCollaborator || !cycle.conclusionCollaborator.trim()) {
    return NextResponse.json({ error: "conclusion_requise" }, { status: 422 });
  }

  const updated = await prisma.revisionCycle.update({
    where: { id },
    data: { status: "soumis_revue", submittedAt: new Date() },
  });

  return NextResponse.json(updated);
}
