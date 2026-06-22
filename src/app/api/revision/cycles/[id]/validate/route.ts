import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canValidateRevisionManager, canValidateRevisionPartner } from "@/lib/permissions";

const BodySchema = z.object({
  decision: z.enum(["valide", "invalide"]),
  level: z.enum(["manager", "associe"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { decision, level } = parsed.data;

  if (level === "manager" && !canValidateRevisionManager(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  if (level === "associe" && !canValidateRevisionPartner(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const cycle = await prisma.revisionCycle.findUnique({ where: { id }, include: { dossier: true } });
  if (!cycle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cycle.dossier.lockedAt) return NextResponse.json({ error: "dossier_verrouille" }, { status: 409 });

  const data =
    level === "manager"
      ? { validatedByManagerId: session.user?.id, validatedByManagerAt: new Date(), status: decision }
      : { validatedByPartnerId: session.user?.id, validatedByPartnerAt: new Date(), status: decision };

  const updated = await prisma.revisionCycle.update({ where: { id }, data });
  return NextResponse.json(updated);
}
