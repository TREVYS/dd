import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const BodySchema = z.object({
  durationMinutes: z.coerce.number().int().positive(),
  description: z.string().optional().nullable(),
  entryDate: z.string().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const entries = await prisma.timeEntry.findMany({
    where: { taskId: id },
    orderBy: { entryDate: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { durationMinutes, description, entryDate } = parsed.data;

  const entry = await prisma.timeEntry.create({
    data: {
      userId: session.user.id,
      clientId: task.clientId,
      taskId: id,
      missionId: task.missionId,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      durationMinutes,
      description,
    },
  });

  const totalMinutes = await prisma.timeEntry.aggregate({
    where: { taskId: id },
    _sum: { durationMinutes: true },
  });
  await prisma.task.update({
    where: { id },
    data: { actualHours: (totalMinutes._sum.durationMinutes ?? 0) / 60 },
  });

  return NextResponse.json(entry, { status: 201 });
}
