import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const opportunity = await prisma.fecOpportunity.findUnique({ where: { id } });
  if (!opportunity) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const task = await prisma.task.create({
    data: {
      clientId: opportunity.clientId,
      title: `[Opportunité ${opportunity.domain}] ${opportunity.title}`,
      description: opportunity.description,
      taskType: "opportunite_mission",
      kanbanColumn: "gestion_mensuelle",
      priority: opportunity.priority === "high" ? "high" : opportunity.priority === "low" ? "low" : "normal",
      managerId: session.user?.id,
    },
  });

  const updated = await prisma.fecOpportunity.update({
    where: { id },
    data: { status: "converted", taskId: task.id },
  });

  return NextResponse.json({ opportunity: updated, task });
}
