import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  const messages = await prisma.chatMessage.findMany({
    where: {
      conversationId: id,
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderId: m.senderId,
      senderName: `${m.sender.firstName} ${m.sender.lastName}`,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === session.user.id,
    }))
  );
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
