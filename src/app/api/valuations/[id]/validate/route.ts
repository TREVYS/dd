import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canValidateValuations } from "@/lib/permissions";
import { z } from "zod";

const ValidateSchema = z.object({
  decision: z.enum(["approved", "changes_requested"]),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canValidateValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const valuation = await prisma.valuation.findUnique({ where: { id } });
  if (!valuation) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (valuation.status !== "pending_validation") {
    return NextResponse.json({ error: "not_pending_validation" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = ValidateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { decision, comment } = parsed.data;

  const updated = await prisma.valuation.update({
    where: { id },
    data: {
      status: decision === "approved" ? "validated" : "changes_requested",
      validatedById: session.user.id,
      validatedAt: new Date(),
    },
  });

  await prisma.valuationComment.create({
    data: {
      valuationId: id,
      authorId: session.user.id,
      body:
        comment?.trim() ||
        (decision === "approved" ? "Valorisation validée." : "Modifications demandées."),
      kind: decision === "approved" ? "approval" : "rejection",
    },
  });

  return NextResponse.json(updated);
}
