import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const fecImport = await prisma.fecImport.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, legalName: true } },
      anomalies: { orderBy: { severity: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
      chatLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!fecImport) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(fecImport);
}
