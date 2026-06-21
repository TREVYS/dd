import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await prisma.fecReport.findUnique({
    where: { shareToken: token },
    include: { client: { select: { legalName: true } }, fecImport: { select: { fiscalYear: true } } },
  });

  if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (report.shareExpiresAt && report.shareExpiresAt < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  await prisma.fecReport.update({
    where: { id: report.id },
    data: { viewedAt: new Date(), viewCount: { increment: 1 } },
  });

  return NextResponse.json({
    title: report.title,
    clientName: report.client.legalName,
    fiscalYear: report.fecImport.fiscalYear,
    content: report.content,
  });
}
