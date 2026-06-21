import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { askFinancialAnalyst } from "@/lib/fec/analyst";
import { FecMetrics } from "@/lib/fec/analyze";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { question } = await req.json();
  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "question manquante" }, { status: 400 });
  }

  const fecImport = await prisma.fecImport.findUnique({
    where: { id },
    include: { anomalies: true, chatLogs: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!fecImport) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const metrics = fecImport.metrics as unknown as FecMetrics;
  const history = fecImport.chatLogs.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  await prisma.fecChatMessage.create({
    data: { fecImportId: id, userId: session.user?.id, role: "user", content: question },
  });

  const answer = await askFinancialAnalyst(
    metrics,
    fecImport.anomalies.map((a) => ({
      type: a.type,
      severity: a.severity as "info" | "warning" | "critical",
      message: a.message,
      accountCode: a.accountCode ?? undefined,
      journalCode: a.journalCode ?? undefined,
    })),
    question,
    history
  );

  await prisma.fecChatMessage.create({
    data: { fecImportId: id, userId: session.user?.id, role: "assistant", content: answer },
  });

  return NextResponse.json({ answer });
}
