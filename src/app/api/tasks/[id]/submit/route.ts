import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const nextStatus = existing.requiresValidation ? "en_attente_manager" : "done";
  const updated = await prisma.task.update({
    where: { id },
    data: {
      status: nextStatus,
      submittedAt: new Date(),
      completedAt: nextStatus === "done" ? new Date() : undefined,
    },
  });

  await prisma.taskStatusHistory.create({
    data: { taskId: id, oldStatus: existing.status, newStatus: nextStatus, changedBy: session.user.id },
  });

  return NextResponse.json(updated);
}
