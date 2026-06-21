import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canPurchaseFormations } from "@/lib/permissions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canPurchaseFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const acquisition = await prisma.formationAcquisition.upsert({
    where: { formationId: id },
    update: {},
    create: { formationId: id, acquiredById: session.user.id },
  });
  return NextResponse.json(acquisition, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canPurchaseFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.formationAcquisition.deleteMany({ where: { formationId: id } });
  return NextResponse.json({ ok: true });
}
