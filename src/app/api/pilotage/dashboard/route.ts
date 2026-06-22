import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageTaskPilotage } from "@/lib/permissions";

const OPEN_STATUSES = ["todo", "in_progress", "review", "en_attente_client", "en_attente_manager"];

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || !canManageTaskPilotage(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [openTasks, lateTasks, dueSoonTasks, openTasksWithHours, users, clients, recentClientIds] =
    await Promise.all([
      prisma.task.count({ where: { status: { in: OPEN_STATUSES } } }),
      prisma.task.count({ where: { status: { in: OPEN_STATUSES }, dueDate: { lt: now } } }),
      prisma.task.count({
        where: { status: { in: OPEN_STATUSES }, dueDate: { gte: now, lte: in7Days } },
      }),
      prisma.task.findMany({
        where: { status: { in: OPEN_STATUSES } },
        select: { estimatedHours: true, assignedTo: true },
      }),
      prisma.user.findMany({
        where: { status: "active" },
        select: { id: true, weeklyCapacityHours: true },
      }),
      prisma.client.count(),
      prisma.task.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { clientId: true },
        distinct: ["clientId"],
      }),
    ]);

  const chargeHours = openTasksWithHours.reduce((sum, t) => sum + Number(t.estimatedHours ?? 0), 0);

  const hoursByUser = new Map<string, number>();
  for (const t of openTasksWithHours) {
    if (!t.assignedTo) continue;
    hoursByUser.set(t.assignedTo, (hoursByUser.get(t.assignedTo) ?? 0) + Number(t.estimatedHours ?? 0));
  }
  const chargeRatios = users.map((u) => {
    const capacity = Number(u.weeklyCapacityHours) || 35;
    const assigned = hoursByUser.get(u.id) ?? 0;
    return Math.min(assigned / capacity, 2);
  });
  const avgCharge = chargeRatios.length
    ? chargeRatios.reduce((a, b) => a + b, 0) / chargeRatios.length
    : 0;
  const availability = Math.max(0, Math.round((1 - avgCharge) * 100));

  const activeClientIds = new Set(recentClientIds.map((c) => c.clientId));
  const inactiveClients = clients - activeClientIds.size;

  return NextResponse.json({
    openTasks,
    lateTasks,
    dueSoonTasks,
    chargeHours: Math.round(chargeHours),
    availability,
    inactiveClients: Math.max(0, inactiveClients),
  });
}
