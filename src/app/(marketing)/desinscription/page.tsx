import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeToken } from "@/lib/newsletter-campaigns";
import { removeSubscriber } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Désinscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Désinscription en un clic depuis un e-mail : le lien contient l'adresse et
// un jeton signé — impossible de désinscrire quelqu'un d'autre.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = (e ?? "").trim();
  const valid = !!email && !!t && unsubscribeToken(email) === t;
  const removed = valid ? removeSubscriber(email) : false;

  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 560, textAlign: "center", padding: "4rem 1rem" }}>
        {valid ? (
          <>
            <h1 style={{ fontSize: "1.7rem", marginBottom: "1rem" }}>
              {removed ? "Vous êtes désinscrit." : "C'est déjà fait."}
            </h1>
            <p style={{ color: "var(--ink2)", lineHeight: 1.7 }}>
              {removed
                ? `L'adresse ${email} ne recevra plus nos analyses. Merci de nous avoir lus — et à bientôt peut-être.`
                : `L'adresse ${email} ne figure plus dans notre liste.`}
            </p>
            <p style={{ color: "var(--ink3)", fontSize: ".9rem", marginTop: "1.2rem" }}>
              Désinscrit par erreur ? Réinscrivez-vous en bas de la page Ressources.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "1.7rem", marginBottom: "1rem" }}>Lien invalide</h1>
            <p style={{ color: "var(--ink2)", lineHeight: 1.7 }}>
              Ce lien de désinscription est incomplet ou expiré. Écrivez-nous à{" "}
              <a href="mailto:contact@trevys-advisory.fr">contact@trevys-advisory.fr</a> et nous
              vous retirerons de la liste immédiatement.
            </p>
          </>
        )}
        <div style={{ marginTop: "2rem" }}>
          <Link className="btn btn-ghost" href="/">← Retour au site</Link>
        </div>
      </div>
    </section>
  );
}
