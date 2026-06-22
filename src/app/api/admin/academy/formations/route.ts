import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations, canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const FormationSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  coverImageUrl: z.string().optional(),
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

  const include = {
    author: { select: { firstName: true, lastName: true } },
    modules: {
      orderBy: { orderIndex: "asc" as const },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" as const },
          include: {
            document: { select: { fileUrl: true } },
            quizQuestions: { include: { options: true }, orderBy: { orderIndex: "asc" as const } },
          },
        },
      },
    },
    _count: { select: { progress: true } },
    acquisition: true,
    teamAccess: true,
  };

  // Administrateur (super admin) et Associé voient tout le store, pour la création / l'achat.
  if (canManageAcademy(session.user.role)) {
    const formations = await prisma.formation.findMany({
      orderBy: { createdAt: "desc" },
      include,
    });
    return NextResponse.json(formations);
  }

  // Manager / Collaborateur : uniquement les formations achetées par le cabinet ET
  // rendues disponibles à leur équipe.
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { teamId: true } });
  const formations = await prisma.formation.findMany({
    where: {
      isPublished: true,
      acquisition: { isNot: null },
      ...(user?.teamId ? { teamAccess: { some: { teamId: user.teamId } } } : { teamAccess: { some: { id: "__none__" } } }),
    },
    orderBy: { createdAt: "desc" },
    include,
  });
  return NextResponse.json(formations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
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
