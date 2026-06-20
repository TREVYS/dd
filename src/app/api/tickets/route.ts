import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TicketSchema = z.object({
  clientId: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().optional(),
  source: z.string().default("collaborateur"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = TicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await prisma.ticket.count();
  const ticketNumber = `TCK-${String(count + 1).padStart(4, "0")}`;

  const ticket = await prisma.ticket.create({
    data: {
      ...parsed.data,
      ticketNumber,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
