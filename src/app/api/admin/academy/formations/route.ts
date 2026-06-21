import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const FormationSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  level: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formations = await prisma.formation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { firstName: true, lastName: true } },
      contents: { orderBy: { orderIndex: "asc" } },
      _count: { select: { progress: true } },
    },
  });

  return NextResponse.json(formations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = FormationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const formation = await prisma.formation.create({
    data: { ...parsed.data, authorId: session.user.id },
  });
  return NextResponse.json(formation, { status: 201 });
}
