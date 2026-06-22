import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TaskSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  taskType: z.string().min(1),
  kanbanColumn: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().default("normal"),
  category: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  secondaryAssigneeIds: z.array(z.string()).optional(),
  managerId: z.string().optional().nullable(),
  missionId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.coerce.number().optional().nullable(),
  requiresValidation: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const assigneeId = req.nextUrl.searchParams.get("assigneeId");
  const managerId = req.nextUrl.searchParams.get("managerId");
  const clientId = req.nextUrl.searchParams.get("clientId");
  const status = req.nextUrl.searchParams.get("status");
  const priority = req.nextUrl.searchParams.get("priority");

  const tasks = await prisma.task.findMany({
    where: {
      ...(assigneeId ? { assignedTo: assigneeId } : {}),
      ...(managerId ? { managerId } : {}),
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    },
    include: {
      client: { select: { id: true, legalName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      mission: { select: { id: true, name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 300,
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { dueDate, managerId, ...rest } = parsed.data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      managerId: managerId ?? session.user.id,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { client: true, assignee: true, manager: true },
  });
  return NextResponse.json(task, { status: 201 });
}
