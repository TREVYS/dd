import { NextResponse } from "next/server";
import { openToken, recordOpen } from "@/lib/newsletter-stats";

export const runtime = "nodejs";

// Pixel de suivi d'ouverture des newsletters : 1×1 transparent.
// L'URL est signée (jeton HMAC) — impossible de fausser les statistiques.
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const c = url.searchParams.get("c") ?? "";
    const e = url.searchParams.get("e") ?? "";
    const t = url.searchParams.get("t") ?? "";
    if (c && e && t) {
      const email = Buffer.from(e, "base64url").toString("utf8");
      if (email && openToken(c, email) === t) recordOpen(c, email);
    }
  } catch { /* jamais d'erreur visible pour le client mail */ }
  return new NextResponse(new Uint8Array(GIF), {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
