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
  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  const ticketMessage = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      senderType: "collaborateur",
      senderId: session.user.id,
      message,
      channel: "app",
    },
  });

  await prisma.ticket.update({
    where: { id },
    data: {
      status: "in_progress",
      firstResponseAt: undefined,
    },
  });

  return NextResponse.json(ticketMessage, { status: 201 });
}
