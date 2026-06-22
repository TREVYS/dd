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

  const [users, openTasks] = await Promise.all([
    prisma.user.findMany({
      where: { status: "active" },
      select: { id: true, firstName: true, lastName: true, weeklyCapacityHours: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.task.findMany({
      where: { status: { in: OPEN_STATUSES }, assignedTo: { not: null } },
      select: { assignedTo: true, estimatedHours: true },
    }),
  ]);

  const hoursByUser = new Map<string, number>();
  for (const t of openTasks) {
    if (!t.assignedTo) continue;
    hoursByUser.set(t.assignedTo, (hoursByUser.get(t.assignedTo) ?? 0) + Number(t.estimatedHours ?? 0));
  }

  const result = users
    .map((u) => {
      const capacity = Number(u.weeklyCapacityHours) || 35;
      const assigned = Math.round((hoursByUser.get(u.id) ?? 0) * 10) / 10;
      const chargePercent = capacity ? Math.round((assigned / capacity) * 100) : 0;
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        capacity,
        assigned,
        chargePercent,
      };
    })
    .sort((a, b) => b.chargePercent - a.chargePercent);

  return NextResponse.json(result);
}
