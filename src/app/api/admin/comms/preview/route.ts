import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markdownToEmailHtml, wrapEmail } from "@/lib/newsletter-campaigns";

export const runtime = "nodejs";

// Aperçu vivant du mailing : reçoit le Markdown en cours de frappe et renvoie
// le HTML e-mail complet (gabarit maison), sans rien enregistrer.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { body } = (await req.json()) as { body?: string };
    const html = wrapEmail(markdownToEmailHtml((body ?? "").trim() || "_(Votre message apparaîtra ici.)_"));
    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: "Aperçu impossible." }, { status: 400 });
  }
}
