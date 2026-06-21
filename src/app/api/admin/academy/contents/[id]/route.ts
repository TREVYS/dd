import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.formationContent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
