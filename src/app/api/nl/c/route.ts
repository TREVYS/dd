import { NextResponse } from "next/server";
import { clickToken, recordClick } from "@/lib/newsletter-stats";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// Suivi des clics des newsletters : compte le clic (lien signé) puis redirige
// immédiatement vers la vraie page. En cas de doute, on redirige sans compter.
export async function GET(req: Request) {
  let dest = SITE_URL;
  try {
    const sp = new URL(req.url).searchParams;
    const c = sp.get("c") ?? "";
    const e = sp.get("e") ?? "";
    const u = sp.get("u") ?? "";
    const t = sp.get("t") ?? "";
    const url = Buffer.from(u, "base64url").toString("utf8");
    if (/^https?:\/\//.test(url)) dest = url;
    const email = Buffer.from(e, "base64url").toString("utf8");
    if (c && email && dest !== SITE_URL && clickToken(c, email, url) === t) {
      recordClick(c, email, url);
    }
  } catch { /* on redirige quand même */ }
  return NextResponse.redirect(dest, 302);
}
