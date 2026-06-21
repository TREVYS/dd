import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageAcademy } from "@/lib/permissions";
import { z } from "zod";

const FILE_TYPES = ["pdf", "word", "excel", "powerpoint"];

const ContentSchema = z.object({
  type: z.enum(["text", "pdf", "word", "excel", "powerpoint", "video", "link"]),
  title: z.string().min(1),
  body: z.string().optional(),
  url: z.string().optional(),
  orderIndex: z.coerce.number().optional(),
});

async function getAcademyFolderId() {
  const existing = await prisma.documentFolder.findFirst({
    where: { name: "Academy", folderType: "academy", clientId: null },
  });
  if (existing) return existing.id;

  let docCabinet = await prisma.documentFolder.findFirst({
    where: { name: "Documentation Cabinet", clientId: null, parentId: null },
  });
  if (!docCabinet) {
    docCabinet = await prisma.documentFolder.create({
      data: { name: "Documentation Cabinet", folderType: "documentation_cabinet", level: 1 },
    });
  }
  return (
    await prisma.documentFolder.create({
      data: { name: "Academy", folderType: "academy", level: 2, parentId: docCabinet.id },
    })
  ).id;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageAcademy(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: formationId } = await params;
  const body = await req.json();
  const parsed = ContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, title, body: textBody, url, orderIndex } = parsed.data;

  let documentId: string | undefined;
  if (FILE_TYPES.includes(type) && url) {
    const folderId = await getAcademyFolderId();
    const document = await prisma.document.create({
      data: {
        name: title,
        folderId,
        documentType: type,
        fileUrl: url,
        uploadedBy: session.user.id,
        source: "academy",
      },
    });
    documentId = document.id;
  }

  const content = await prisma.formationContent.create({
    data: {
      formationId,
      type,
      title,
      body: textBody,
      url: FILE_TYPES.includes(type) ? undefined : url,
      documentId,
      orderIndex: orderIndex ?? 0,
    },
  });
  return NextResponse.json(content, { status: 201 });
}
