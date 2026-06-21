import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { canManageValuationBranding } from "@/lib/permissions";
import { saveValuationBranding } from "@/lib/valuation/branding";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageValuationBranding(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "fichier manquant" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", "branding");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);
  const logoUrl = `/uploads/branding/${storedName}`;

  const saved = await saveValuationBranding({ logoUrl });
  return NextResponse.json(saved);
}
