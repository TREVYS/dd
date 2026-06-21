import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const DocumentSchema = z.object({
  clientId: z.string().min(1),
  folderId: z.string().optional(),
  name: z.string().min(1),
  documentType: z.string().optional(),
  category: z.string().optional(),
  fiscalYear: z.coerce.number().optional(),
  fileUrl: z.string().min(1),
  fileSize: z.coerce.number().optional(),
  mimeType: z.string().optional(),
  ocrText: z.string().optional(),
  aiSummary: z.string().optional(),
  source: z.string().optional(),
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

  const { fileSize, ...rest } = parsed.data;
  const document = await prisma.document.create({
    data: {
      ...rest,
      fileSize: fileSize !== undefined ? BigInt(fileSize) : undefined,
      uploadedBy: session.user.id,
      source: parsed.data.source ?? "manual",
    },
  });
  return NextResponse.json(document, { status: 201 });
}
