import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TaskSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  taskType: z.string().min(1),
  kanbanColumn: z.string().min(1),
  status: z.string().min(1),
  priority: z.string().default("normal"),
  assignedTo: z.string().optional(),
});

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

  const task = await prisma.task.create({
    data: { ...parsed.data, managerId: session.user.id },
    include: { client: true, assignee: true },
  });
  return NextResponse.json(task, { status: 201 });
}
