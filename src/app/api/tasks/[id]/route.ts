import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  const { kanbanColumn, status, title, priority, tags, assignedTo, dueDate, description } = body as {
    kanbanColumn?: string;
    status?: string;
    title?: string;
    priority?: string;
    tags?: string[];
    assignedTo?: string | null;
    dueDate?: string | null;
    description?: string | null;
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
      tags,
      assignedTo,
      description,
      dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
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
