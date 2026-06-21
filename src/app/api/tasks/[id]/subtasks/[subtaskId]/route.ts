import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { subtaskId } = await params;
  const { isDone } = (await req.json()) as { isDone?: boolean };

  const updated = await prisma.taskSubtask.update({
    where: { id: subtaskId },
    data: { isDone },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { subtaskId } = await params;
  await prisma.taskSubtask.delete({ where: { id: subtaskId } });
  return NextResponse.json({ ok: true });
}
