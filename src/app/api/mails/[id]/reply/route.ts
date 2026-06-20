import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ReplySchema = z.object({
  body: z.string().min(1),
  aiGenerated: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.mail.findUnique({ where: { id } });
  if (!existing || existing.recipientId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const reply = await prisma.mailReply.create({
    data: {
      mailId: id,
      authorId: session.user.id,
      body: parsed.data.body,
      aiGenerated: parsed.data.aiGenerated ?? false,
    },
  });

  await prisma.mail.update({
    where: { id },
    data: { status: "traite", isRead: true },
  });

  return NextResponse.json(reply, { status: 201 });
}
