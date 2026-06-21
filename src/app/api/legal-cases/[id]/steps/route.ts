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
  const { label } = (await req.json()) as { label?: string };
  if (!label?.trim()) {
    return NextResponse.json({ error: "label required" }, { status: 400 });
  }

  const count = await prisma.legalCaseStep.count({ where: { legalCaseId: id } });
  const step = await prisma.legalCaseStep.create({
    data: { legalCaseId: id, label: label.trim(), orderIndex: count },
  });

  await prisma.legalCase.update({ where: { id }, data: { status: "en_cours" } });

  return NextResponse.json(step, { status: 201 });
}
