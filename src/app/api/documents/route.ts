import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const DocumentSchema = z.object({
  clientId: z.string().min(1),
  folderId: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  fiscalYear: z.coerce.number().optional(),
  fileUrl: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = DocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: { ...parsed.data, uploadedBy: session.user.id, source: "manual" },
  });
  return NextResponse.json(document, { status: 201 });
}
