import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const valuation = await prisma.valuation.findUnique({ where: { id } });
  if (!valuation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await prisma.valuation.update({
    where: { id },
    data: {
      status: "pending_validation",
      submittedAt: new Date(),
      validatedById: null,
      validatedAt: null,
    },
  });

  await prisma.valuationComment.create({
    data: {
      valuationId: id,
      authorId: session.user.id,
      body: "Dossier soumis pour validation.",
      kind: "submission",
    },
  });

  return NextResponse.json(updated);
}
