import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const ParcoursSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  formationIds: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parcours = await prisma.parcours.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      formations: {
        orderBy: { orderIndex: "asc" },
        include: { formation: true },
      },
    },
  });
  return NextResponse.json(parcours);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ParcoursSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { formationIds, ...rest } = parsed.data;
  const parcours = await prisma.parcours.create({
    data: {
      ...rest,
      formations: formationIds
        ? { create: formationIds.map((formationId, i) => ({ formationId, orderIndex: i })) }
        : undefined,
    },
  });
  return NextResponse.json(parcours, { status: 201 });
}
