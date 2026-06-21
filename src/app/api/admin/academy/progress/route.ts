import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const progress = await prisma.formationProgress.findMany({
    include: {
      user: { select: { firstName: true, lastName: true } },
      formation: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(progress);
}
