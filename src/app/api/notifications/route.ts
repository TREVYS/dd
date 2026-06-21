import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [tasksToday, ticketsToTreat] = await Promise.all([
    prisma.task.findMany({
      where: {
        assignedTo: userId,
        status: { not: "done" },
        dueDate: { gte: startOfDay, lt: endOfDay },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
      select: { id: true, title: true },
    }),
    prisma.ticket.findMany({
      where: { assignedTo: userId, status: { not: "closed" } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, subject: true },
    }),
  ]);

  return NextResponse.json({ tasksToday, ticketsToTreat });
}
