import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { parseFec } from "@/lib/fec/parser";
import { computeMetrics, detectAnomalies } from "@/lib/fec/analyze";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("clientId");
  const imports = await prisma.fecImport.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, legalName: true } },
      uploadedBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { anomalies: true, reports: true } },
    },
    take: 50,
  });

  return NextResponse.json(imports);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const clientId = formData.get("clientId");
  const fiscalYearRaw = formData.get("fiscalYear");

  if (!(file instanceof File) || typeof clientId !== "string" || !clientId) {
    return NextResponse.json({ error: "fichier ou client manquant" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rawContent = buffer.toString("utf-8");
  const parsed = parseFec(rawContent);

  if (parsed.missingColumns.length > 0) {
    return NextResponse.json(
      {
        error: "structure_invalide",
        message: `Colonnes obligatoires manquantes : ${parsed.missingColumns.join(", ")}`,
      },
      { status: 422 }
    );
  }

  if (parsed.lines.length === 0) {
    return NextResponse.json({ error: "fichier vide ou illisible" }, { status: 422 });
  }

  const detectedYears = parsed.lines
    .map((l) => l.ecritureDate.slice(0, 4))
    .filter((y) => /^\d{4}$/.test(y))
    .map(Number);
  const fiscalYear =
    typeof fiscalYearRaw === "string" && fiscalYearRaw
      ? Number(fiscalYearRaw)
      : detectedYears.length > 0
        ? mode(detectedYears)
        : new Date().getFullYear();

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storedName = `${randomUUID()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", clientId, "fec");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);
  const fileUrl = `/uploads/${clientId}/fec/${storedName}`;

  const anomalies = detectAnomalies(parsed.lines);
  const metrics = computeMetrics(parsed.lines, fiscalYear);

  const fecImport = await prisma.fecImport.create({
    data: {
      clientId,
      fiscalYear,
      fileUrl,
      fileName: file.name,
      lineCount: parsed.lines.length,
      journalCount: metrics.journalCount,
      status: "analyzed",
      metrics: metrics as object,
      uploadedById: session.user?.id,
      anomalies: {
        create: anomalies.map((a) => ({
          type: a.type,
          severity: a.severity,
          message: a.message,
          accountCode: a.accountCode,
          journalCode: a.journalCode,
        })),
      },
    },
    include: { anomalies: true },
  });

  return NextResponse.json(fecImport);
}

function mode(values: number[]) {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
