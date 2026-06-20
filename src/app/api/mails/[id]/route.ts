import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const MailUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  status: z.enum(["a_traiter", "traite"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = MailUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.mail.findUnique({ where: { id } });
  if (!existing || existing.recipientId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const mail = await prisma.mail.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(mail);
}
