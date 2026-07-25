import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { auth } from "@/lib/auth";
import { CV_DIR } from "@/lib/jobs";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Téléchargement d'un CV — réservé au cockpit (les CV ne sont jamais publics).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { name } = await params;
  const safe = path.basename(name);
  const full = path.join(CV_DIR, safe);
  if (!full.startsWith(CV_DIR) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    return new NextResponse("Introuvable", { status: 404 });
  }
  const ext = path.extname(safe).slice(1).toLowerCase();
  return new NextResponse(new Uint8Array(fs.readFileSync(full)), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safe}"`,
    },
  });
}
