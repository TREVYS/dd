import { NextResponse } from "next/server";
import { trackView, trackEvent } from "@/lib/analytics";

// Endpoint public de collecte (balise côté client). Aucune donnée personnelle.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { type?: string; path?: string; name?: string };
    if (body.type === "view" && typeof body.path === "string") {
      trackView(body.path);
    } else if (body.type === "event" && typeof body.name === "string") {
      trackEvent(body.name);
    }
  } catch {
    /* payload invalide : on ignore */
  }
  return new NextResponse(null, { status: 204 });
}
