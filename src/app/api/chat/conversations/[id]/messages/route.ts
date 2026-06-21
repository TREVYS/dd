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
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim()) {
    return NextResponse.json({ error: "message vide" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: { conversationId: id, senderId: session.user.id, body: body.trim() },
    include: { sender: true },
  });

  await prisma.conversationMember.update({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({
    id: message.id,
    body: message.body,
    senderId: message.senderId,
    senderName: `${message.sender.firstName} ${message.sender.lastName}`,
    createdAt: message.createdAt.toISOString(),
    isMine: true,
  });
}
