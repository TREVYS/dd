import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { canManageCollaborators } from "@/lib/permissions";

const TeamSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const session = await auth();
  if (!session || !canManageCollaborators(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { members: { include: { role: true } } },
  });
  return NextResponse.json(
    teams.map((t) => ({
      id: t.id,
      name: t.name,
      members: t.members.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        roleName: m.role?.name ?? null,
        weeklyCapacityHours: Number(m.weeklyCapacityHours),
      })),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageCollaborators(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = TeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const team = await prisma.team.create({ data: parsed.data });
  return NextResponse.json(team, { status: 201 });
}
