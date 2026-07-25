import { NextResponse } from "next/server";
import { trackView, trackEvent, classifySource } from "@/lib/analytics";

// Endpoint public de collecte (balise côté client). Aucune donnée personnelle,
// aucun cookie : la provenance n'est comptée qu'au premier écran de la visite.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type?: string;
      path?: string;
      name?: string;
      ref?: string; // referrer, envoyé uniquement en début de visite
      nv?: number; // 1 = nouvelle visite
    };
    if (body.type === "view" && typeof body.path === "string") {
      let visit: { source?: string; device?: string } | undefined;
      if (body.nv === 1) {
        const source = classifySource(String(body.ref ?? ""));
        const ua = req.headers.get("user-agent") ?? "";
        const device = /mobi|android|iphone|ipad/i.test(ua) ? "Mobile" : "Ordinateur";
        visit = { source: source || undefined, device };
      }
      trackView(body.path, visit);
    } else if (body.type === "event" && typeof body.name === "string") {
      trackEvent(body.name);
    }
  } catch {
    /* payload invalide : on ignore */
  }
  return new NextResponse(null, { status: 204 });
}
