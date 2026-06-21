import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { expiresInDays = 30 } = await req.json().catch(() => ({}));

  const token = randomBytes(24).toString("hex");
  const shareExpiresAt = new Date(Date.now() + Number(expiresInDays) * 24 * 60 * 60 * 1000);

  const report = await prisma.fecReport.update({
    where: { id },
    data: { shareToken: token, shareExpiresAt, status: "sent", sentAt: new Date() },
  });

  return NextResponse.json({
    token: report.shareToken,
    expiresAt: report.shareExpiresAt,
    url: `/fec-partage/${report.shareToken}`,
  });
}
