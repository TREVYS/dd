import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const LESSON_TYPES = ["video", "text", "pdf", "checklist", "quiz", "case_study", "webinar"] as const;

const LessonSchema = z.object({
  type: z.enum(LESSON_TYPES),
  title: z.string().min(1),
  body: z.string().optional(),
  videoUrl: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
  orderIndex: z.coerce.number().optional(),
  documentUrl: z.string().optional(),
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
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: moduleId } = await params;
  const body = await req.json();
  const parsed = LessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, title, body: textBody, videoUrl, durationMinutes, orderIndex, documentUrl } = parsed.data;

  let documentId: string | undefined;
  if (type === "pdf" && documentUrl) {
    const folderId = await getAcademyFolderId();
    const document = await prisma.document.create({
      data: {
        name: title,
        folderId,
        documentType: "pdf",
        fileUrl: documentUrl,
        uploadedBy: session.user.id,
        source: "academy",
      },
    });
    documentId = document.id;
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      type,
      title,
      body: textBody,
      videoUrl,
      documentId,
      durationMinutes,
      orderIndex: orderIndex ?? 0,
    },
  });
  return NextResponse.json(lesson, { status: 201 });
}
