import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sert les médias importés (public/uploads) via une route, car les fichiers
// ajoutés après le build ne sont pas servis statiquement sur l'instance.
const DIR = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  ico: "image/x-icon",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = (parts ?? []).join("/");
  // Sécurité : pas de traversée de répertoire.
  const safe = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(DIR, safe);
  if (!full.startsWith(DIR) || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const ext = path.extname(full).slice(1).toLowerCase();
  const buf = fs.readFileSync(full);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
