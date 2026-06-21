import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title } = (await req.json()) as { title?: string };
  if (!title?.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const count = await prisma.taskSubtask.count({ where: { taskId: id } });
  const subtask = await prisma.taskSubtask.create({
    data: { taskId: id, title: title.trim(), orderIndex: count },
  });
  return NextResponse.json(subtask, { status: 201 });
}
