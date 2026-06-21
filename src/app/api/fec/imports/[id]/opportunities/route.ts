import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { generateOpportunities } from "@/lib/fec/analyst";
import { FecMetrics } from "@/lib/fec/analyze";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const opportunities = await prisma.fecOpportunity.findMany({
    where: { fecImportId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(opportunities);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const fecImport = await prisma.fecImport.findUnique({
    where: { id },
    include: { anomalies: true },
  });
  if (!fecImport) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const metrics = fecImport.metrics as unknown as FecMetrics;
  const drafts = await generateOpportunities(
    metrics,
    fecImport.anomalies.map((a) => ({
      type: a.type,
      severity: a.severity as "info" | "warning" | "critical",
      message: a.message,
      accountCode: a.accountCode ?? undefined,
      journalCode: a.journalCode ?? undefined,
    }))
  );

  if (drafts.length === 0) {
    return NextResponse.json(
      { error: "Aucune opportunité générée (IA non configurée ou aucune piste détectée)." },
      { status: 422 }
    );
  }

  const created = await prisma.$transaction(
    drafts.map((d) =>
      prisma.fecOpportunity.create({
        data: {
          fecImportId: id,
          clientId: fecImport.clientId,
          domain: d.domain,
          title: d.title,
          description: d.description,
          priority: d.priority,
          estimatedValue: d.estimatedValue,
        },
      })
    )
  );

  return NextResponse.json(created);
}
