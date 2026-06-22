import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRevision } from "@/lib/permissions";

async function getRevisionFolderId(clientId: string) {
  const existing = await prisma.documentFolder.findFirst({
    where: { clientId, name: "Révision comptable", folderType: "revision" },
  });
  if (existing) return existing.id;

  return (
    await prisma.documentFolder.create({
      data: { clientId, name: "Révision comptable", folderType: "revision", level: 1 },
    })
  ).id;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageRevision(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: cycleId } = await params;
  const cycle = await prisma.revisionCycle.findUnique({ where: { id: cycleId }, include: { dossier: true } });
  if (!cycle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (cycle.dossier.lockedAt) return NextResponse.json({ error: "dossier_verrouille" }, { status: 409 });

  const formData = await req.formData();
  const file = formData.get("file");
  const label = formData.get("label");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "fichier manquant" }, { status: 400 });
  }

  const clientId = cycle.dossier.clientId;
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", clientId, "revision");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);
  const fileUrl = `/uploads/${clientId}/revision/${storedName}`;

  const folderId = await getRevisionFolderId(clientId);
  const document = await prisma.document.create({
    data: {
      clientId,
      name: file.name,
      folderId,
      documentType: "other",
      fileUrl,
      uploadedBy: session.user?.id,
      source: "revision",
    },
  });

  const attachment = await prisma.revisionAttachment.create({
    data: {
      cycleId,
      documentId: document.id,
      label: typeof label === "string" ? label : null,
    },
    include: { document: true },
  });

  return NextResponse.json(attachment, { status: 201 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id: cycleId } = await params;
  const attachments = await prisma.revisionAttachment.findMany({
    where: { cycleId },
    include: { document: { select: { id: true, name: true, fileUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(attachments);
}
