import { NextResponse } from "next/server";
import { unsubscribeToken } from "@/lib/newsletter-campaigns";
import { removeSubscriber, markUnsubscribed } from "@/lib/newsletter";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// Désinscription « en un clic » : c'est l'adresse annoncée aux messageries
// dans l'en-tête List-Unsubscribe. Quand le lecteur clique sur leur bouton
// « Se désabonner », la messagerie envoie une requête POST ici — le jeton
// signé garantit qu'on ne peut désinscrire que sa propre adresse.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("e") ?? "").trim();
    const t = url.searchParams.get("t") ?? "";
    if (email && t && unsubscribeToken(email) === t) {
      removeSubscriber(email);
      markUnsubscribed(email);
    }
  } catch { /* réponse neutre dans tous les cas */ }
  return new NextResponse(null, { status: 200 });
}

// Ouverture du lien dans un navigateur : on renvoie vers la page habituelle.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dest = new URL("/desinscription", SITE_URL);
  dest.search = url.search;
  return NextResponse.redirect(dest, 302);
}
