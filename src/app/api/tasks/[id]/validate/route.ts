import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canValidateTasks } from "@/lib/permissions";

const BodySchema = z.object({
  decision: z.enum(["valide", "refuse", "correction"]),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canValidateTasks(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { decision, comment } = parsed.data;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const nextStatus = decision === "valide" ? "valide" : decision === "correction" ? "in_progress" : "todo";

  const updated = await prisma.task.update({
    where: { id },
    data: {
      status: nextStatus,
      validatedById: decision === "valide" ? session.user.id : null,
      validatedAt: decision === "valide" ? new Date() : null,
    },
  });

  await prisma.taskStatusHistory.create({
    data: { taskId: id, oldStatus: existing.status, newStatus: nextStatus, changedBy: session.user.id },
  });

  if (comment) {
    await prisma.taskComment.create({ data: { taskId: id, authorId: session.user.id, body: comment } });
  }

  return NextResponse.json(updated);
}
