import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id, stepId } = await params;
  const { isDone } = (await req.json()) as { isDone: boolean };

  const step = await prisma.legalCaseStep.update({
    where: { id: stepId },
    data: { isDone, doneAt: isDone ? new Date() : null },
  });

  const allSteps = await prisma.legalCaseStep.findMany({ where: { legalCaseId: id } });
  const allDone = allSteps.length > 0 && allSteps.every((s) => s.isDone);
  const anyDone = allSteps.some((s) => s.isDone);

  await prisma.legalCase.update({
    where: { id },
    data: {
      status: allDone ? "termine" : anyDone ? "en_cours" : "a_faire",
      completedAt: allDone ? new Date() : null,
    },
  });

  return NextResponse.json(step);
}
