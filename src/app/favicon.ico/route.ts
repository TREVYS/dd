import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

// /favicon.ico : l'emplacement que Google (et les navigateurs) consultent en
// priorité pour l'icône des résultats de recherche. On sert le badge TS
// (PNG accepté à cette adresse), avec repli sur le SVG embarqué.
export async function GET() {
  const png = path.join(process.cwd(), "public", "uploads", "logo.png");
  try {
    if (fs.existsSync(png)) {
      return new NextResponse(new Uint8Array(fs.readFileSync(png)), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  } catch { /* repli SVG */ }
  const svg = path.join(process.cwd(), "public", "brand", "ts-badge.svg");
  return new NextResponse(fs.readFileSync(svg, "utf8"), {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
