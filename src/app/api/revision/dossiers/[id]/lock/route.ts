import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canValidateRevisionPartner } from "@/lib/permissions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canValidateRevisionPartner(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const dossier = await prisma.revisionDossier.findUnique({
    where: { id },
    include: { cycles: true },
  });
  if (!dossier) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (dossier.lockedAt) return NextResponse.json({ error: "deja_verrouille" }, { status: 409 });

  const blockers: string[] = [];

  const untreated = dossier.cycles.filter(
    (c) => c.isApplicable && c.status !== "valide" && c.status !== "non_applicable"
  );
  if (untreated.length > 0) {
    blockers.push(`${untreated.length} cycle(s) applicable(s) non validé(s) : ${untreated.map((c) => c.label).join(", ")}`);
  }

  if (!dossier.synthesisNote) {
    blockers.push("La note de synthèse n'a pas été rédigée.");
  }

  if (blockers.length > 0) {
    return NextResponse.json({ error: "cloture_impossible", blockers }, { status: 422 });
  }

  const updated = await prisma.revisionDossier.update({
    where: { id },
    data: { lockedAt: new Date(), status: "cloture" },
  });

  return NextResponse.json(updated);
}
