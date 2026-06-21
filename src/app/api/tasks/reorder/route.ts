import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { moves } = body as {
    moves: { id: string; kanbanColumn: string; status: string; orderIndex: number }[];
  };

  if (!Array.isArray(moves) || moves.length === 0) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await prisma.$transaction(
    moves.map((m) =>
      prisma.task.update({
        where: { id: m.id },
        data: { kanbanColumn: m.kanbanColumn, status: m.status, orderIndex: m.orderIndex },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
