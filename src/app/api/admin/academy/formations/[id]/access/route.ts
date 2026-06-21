import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canPurchaseFormations } from "@/lib/permissions";
import { z } from "zod";

const AccessSchema = z.object({ teamId: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canPurchaseFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const acquisition = await prisma.formationAcquisition.findUnique({ where: { formationId: id } });
  if (!acquisition) {
    return NextResponse.json({ error: "Cette formation doit d'abord être achetée." }, { status: 400 });
  }

  const body = await req.json();
  const parsed = AccessSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const access = await prisma.formationTeamAccess.upsert({
    where: { formationId_teamId: { formationId: id, teamId: parsed.data.teamId } },
    update: {},
    create: { formationId: id, teamId: parsed.data.teamId, grantedById: session.user.id },
  });
  return NextResponse.json(access, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canPurchaseFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) {
    return NextResponse.json({ error: "teamId requis" }, { status: 400 });
  }

  await prisma.formationTeamAccess.deleteMany({ where: { formationId: id, teamId } });
  return NextResponse.json({ ok: true });
}
