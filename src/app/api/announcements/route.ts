import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const AnnouncementSchema = z.object({
  category: z.enum(["fiscalite", "attention", "objectif", "info"]),
  title: z.string().min(1),
  content: z.string().min(1),
  endsAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "Associé") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = AnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      category: parsed.data.category,
      title: parsed.data.title,
      content: parsed.data.content,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
