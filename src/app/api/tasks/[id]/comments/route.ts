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
  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  const comment = await prisma.taskComment.create({
    data: { taskId: id, authorId: session.user.id, body: body.trim() },
    include: { author: true },
  });
  return NextResponse.json(comment, { status: 201 });
}
