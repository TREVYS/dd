import { NextResponse } from "next/server";
import { optinToken, markDeclined } from "@/lib/newsletter-optin";
import { addSubscriber } from "@/lib/newsletter";

export const runtime = "nodejs";

// Réponse à l'invitation newsletter (OUI / NON). Lien signé — impossible
// d'inscrire quelqu'un à sa place. Affiche une page de confirmation sobre.
function page(title: string, text: string): NextResponse {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Trevys</title></head>
<body style="margin:0;background:#f2ece2;font-family:Arial,Helvetica,sans-serif;color:#2a241c;">
<div style="max-width:480px;margin:10vh auto;padding:2.4rem 2rem;background:#fff;border:1px solid #eadfcd;border-radius:20px;text-align:center;">
<div style="height:6px;background:#F5811F;border-radius:100px;margin:-1rem -0.5rem 1.6rem;"></div>
<h1 style="font-size:1.4rem;margin:0 0 .8rem;">${title}</h1>
<p style="line-height:1.7;color:#6b5f4c;margin:0 0 1.6rem;">${text}</p>
<a href="https://www.trevys.fr" style="display:inline-block;background:#1B1712;color:#fff;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:100px;">Visiter www.trevys.fr</a>
</div></body></html>`;
  return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const e = url.searchParams.get("e") ?? "";
    const t = url.searchParams.get("t") ?? "";
    const a = url.searchParams.get("a") ?? "";
    const email = Buffer.from(e, "base64url").toString("utf8");
    if (!email || optinToken(email) !== t) {
      return page("Lien invalide", "Ce lien n'est plus valide. Vous pouvez vous inscrire directement depuis notre site.");
    }
    if (a === "oui") {
      addSubscriber(email, "invitation");
      return page(
        "Bienvenue à bord ! 🎉",
        "C'est noté : vous recevrez nos analyses (une à deux fois par mois, promis). Ravi de garder le lien avec vous.",
      );
    }
    markDeclined(email);
    return page(
      "C'est noté, sans rancune 🤝",
      "Nous ne vous enverrons pas nos analyses. Si vous changez d'avis un jour, notre site vous tend les bras.",
    );
  } catch {
    return page("Lien invalide", "Ce lien n'a pas pu être vérifié. Vous pouvez vous inscrire directement depuis notre site.");
  }
}
