import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { generateMeetingPrep } from "@/lib/fec/analyst";
import { FecMetrics } from "@/lib/fec/analyze";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const fecImport = await prisma.fecImport.findUnique({
    where: { id },
    include: { anomalies: true, opportunities: true },
  });
  if (!fecImport) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const metrics = fecImport.metrics as unknown as FecMetrics;
  const meetingPrep = await generateMeetingPrep(
    metrics,
    fecImport.anomalies.map((a) => ({
      type: a.type,
      severity: a.severity as "info" | "warning" | "critical",
      message: a.message,
      accountCode: a.accountCode ?? undefined,
      journalCode: a.journalCode ?? undefined,
    })),
    fecImport.opportunities.map((o) => ({
      domain: o.domain as "fiscal" | "social" | "juridique" | "finance",
      title: o.title,
      description: o.description,
      priority: o.priority as "low" | "medium" | "high",
      estimatedValue: o.estimatedValue ? Number(o.estimatedValue) : null,
    }))
  );

  await prisma.fecImport.update({ where: { id }, data: { meetingPrep: meetingPrep as object } });

  return NextResponse.json(meetingPrep);
}
