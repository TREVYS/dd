import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, legalName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      validatedBy: { select: { id: true, firstName: true, lastName: true } },
      subtasks: { orderBy: { orderIndex: "asc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      timeEntries: { orderBy: { entryDate: "desc" } },
    },
  });
  if (!task) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const {
    kanbanColumn,
    status,
    title,
    priority,
    category,
    tags,
    assignedTo,
    secondaryAssigneeIds,
    managerId,
    dueDate,
    description,
    estimatedHours,
    actualHours,
    requiresValidation,
  } = body as {
    kanbanColumn?: string;
    status?: string;
    title?: string;
    priority?: string;
    category?: string | null;
    tags?: string[];
    assignedTo?: string | null;
    secondaryAssigneeIds?: string[];
    managerId?: string | null;
    dueDate?: string | null;
    description?: string | null;
    estimatedHours?: number | null;
    actualHours?: number | null;
    requiresValidation?: boolean;
  };

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      kanbanColumn,
      status,
      title,
      priority,
      category,
      tags,
      assignedTo,
      secondaryAssigneeIds,
      managerId,
      description,
      estimatedHours,
      actualHours,
      requiresValidation,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      completedAt: status === "done" && existing.status !== "done" ? new Date() : undefined,
    },
  });

  if (status && status !== existing.status) {
    await prisma.taskStatusHistory.create({
      data: {
        taskId: id,
        oldStatus: existing.status,
        newStatus: status,
        changedBy: session.user.id,
      },
    });
  }

  return NextResponse.json(updated);
}
