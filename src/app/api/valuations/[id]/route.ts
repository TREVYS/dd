import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const valuation = await prisma.valuation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, legalName: true } },
      fecImport: { select: { id: true, fiscalYear: true, metrics: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      validatedBy: { select: { firstName: true, lastName: true } },
      versions: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { firstName: true, lastName: true } } } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { firstName: true, lastName: true } } } },
    },
  });

  if (!valuation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(valuation);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.valuation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
