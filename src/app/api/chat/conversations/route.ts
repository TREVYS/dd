import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const result = await Promise.all(
    conversations.map(async (c) => {
      const me = c.members.find((m) => m.userId === session.user.id);
      const others = c.members.filter((m) => m.userId !== session.user.id);
      const unreadCount = await prisma.chatMessage.count({
        where: {
          conversationId: c.id,
          createdAt: { gt: me?.lastReadAt ?? new Date(0) },
          senderId: { not: session.user.id },
        },
      });
      return {
        id: c.id,
        isGroup: c.isGroup,
        name: c.isGroup
          ? c.name
          : others[0]
            ? `${others[0].user.firstName} ${others[0].user.lastName}`
            : "Conversation",
        otherUserId: !c.isGroup ? others[0]?.userId ?? null : null,
        lastMessage: c.messages[0]?.body ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unreadCount,
      };
    })
  );

  result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { userId, memberIds, name } = (await req.json()) as {
    userId?: string;
    memberIds?: string[];
    name?: string;
  };

  if (userId) {
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        members: { some: { userId: session.user.id } },
        AND: { members: { some: { userId } } },
      },
      include: { members: true },
    });
    if (existing && existing.members.length === 2) {
      return NextResponse.json(existing);
    }

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        members: { create: [{ userId: session.user.id }, { userId }] },
      },
    });
    return NextResponse.json(conversation, { status: 201 });
  }

  if (memberIds && memberIds.length > 0) {
    const allMembers = Array.from(new Set([session.user.id, ...memberIds]));
    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: name ?? "Groupe",
        members: { create: allMembers.map((id) => ({ userId: id })) },
      },
    });
    return NextResponse.json(conversation, { status: 201 });
  }

  return NextResponse.json({ error: "userId ou memberIds requis" }, { status: 400 });
}
