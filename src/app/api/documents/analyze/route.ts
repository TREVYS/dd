import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { extractText } from "@/lib/ocr";
import { classifyDocument } from "@/lib/document-classifier";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const clientId = formData.get("clientId");

  if (!(file instanceof File) || typeof clientId !== "string" || !clientId) {
    return NextResponse.json({ error: "fichier ou client manquant" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", clientId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);
  const fileUrl = `/uploads/${clientId}/${storedName}`;

  const ocrText = await extractText(buffer, file.type || null);

  const folders = await prisma.documentFolder.findMany({
    where: { clientId, isActive: true },
    select: { id: true, name: true, folderType: true, fiscalYear: true },
  });

  const suggestion = await classifyDocument(file.name, ocrText, folders);

  return NextResponse.json({
    fileUrl,
    fileName: file.name,
    fileSize: buffer.length,
    mimeType: file.type || null,
    ocrText,
    suggestion,
  });
}
