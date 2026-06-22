import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseFec } from "@/lib/fec/parser";
import { sumByPrefix } from "@/lib/fec/analyze";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const dossier = await prisma.revisionDossier.findUnique({
    where: { id },
    include: {
      fecImport: true,
      cycles: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!dossier) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let lines: ReturnType<typeof parseFec>["lines"] = [];
  if (dossier.fecImport?.fileUrl) {
    try {
      const filePath = path.join(process.cwd(), "public", dossier.fecImport.fileUrl.replace(/^\/+/, ""));
      const raw = await readFile(filePath, "utf-8");
      lines = parseFec(raw).lines;
    } catch {
      lines = [];
    }
  }

  const cycles = dossier.cycles.map((cycle) => {
    const filtered = lines.filter((l) => cycle.accountPrefixes.some((p) => l.compteNum.startsWith(p)));
    const solde = lines.length ? sumByPrefix(lines, cycle.accountPrefixes, "net") : null;
    return {
      ...cycle,
      computed: {
        lineCount: filtered.length,
        solde,
      },
    };
  });

  return NextResponse.json(cycles);
}
