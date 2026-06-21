import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { generateReportContent } from "@/lib/fec/analyst";
import { FecMetrics } from "@/lib/fec/analyze";

const REPORT_LABELS: Record<string, string> = {
  synthese_dirigeant: "Synthèse dirigeant",
  rapport_gestion: "Rapport de gestion",
  note_cloture: "Note de clôture",
  analyse_marges: "Analyse des marges",
  analyse_charges: "Analyse des charges",
  analyse_tresorerie: "Analyse de trésorerie",
  rapport_banque: "Rapport banque",
  rapport_investisseur: "Rapport investisseur",
  restitution_annuelle: "Restitution annuelle client",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { type = "synthese_dirigeant", tone = "dirigeant" } = await req.json().catch(() => ({}));

  const fecImport = await prisma.fecImport.findUnique({
    where: { id },
    include: { anomalies: true },
  });
  if (!fecImport) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const metrics = fecImport.metrics as unknown as FecMetrics;
  const content = await generateReportContent(
    metrics,
    fecImport.anomalies.map((a) => ({
      type: a.type,
      severity: a.severity as "info" | "warning" | "critical",
      message: a.message,
      accountCode: a.accountCode ?? undefined,
      journalCode: a.journalCode ?? undefined,
    })),
    type,
    tone
  );

  const report = await prisma.fecReport.create({
    data: {
      fecImportId: id,
      clientId: fecImport.clientId,
      title: `${REPORT_LABELS[type] ?? type} — exercice ${fecImport.fiscalYear}`,
      type,
      tone,
      content: { ...content, metrics, chartData: { monthlyCA: metrics.monthlyCA, monthlyCharges: metrics.monthlyCharges } } as object,
      status: "draft",
      createdById: session.user?.id,
    },
  });

  return NextResponse.json(report);
}
