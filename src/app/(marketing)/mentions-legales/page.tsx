import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Trevys Advisory (T.A. TREVYS ADVISORY).",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: ".6rem" }}>{title}</h2>
      <div style={{ color: "var(--ink2)", lineHeight: 1.7, fontSize: ".95rem" }}>{children}</div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Informations légales</span>
          <h1>Mentions légales</h1>
        </div>
      </header>
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: "820px" }}>
          <Block title="Éditeur du site">
            Le présent site est édité par <strong>T.A. TREVYS ADVISORY</strong>.<br />
            Forme juridique : EURL (Entreprise Unipersonnelle à Responsabilité Limitée).<br />
            Siège social : 13 avenue Bugeaud, 75116 Paris, France.<br />
            Capital social : 1 000,00 €.<br />
            SIREN : 839 267 804 — SIRET (siège) : 839 267 804 00038.<br />
            RCS : 839 267 804 R.C.S. Paris.<br />
            TVA intracommunautaire : FR32839267804.<br />
            Code NAF/APE : 69.20Z (Activités comptables).<br />
            Directeur de la publication : John Lévy.
          </Block>
          <Block title="Contact">
            Téléphone : +33 7 68 05 04 65 — E-mail : contact@trevys-advisory.fr
          </Block>
          <Block title="Hébergement">
            Le site est hébergé par Gandi SAS, 63-65 Boulevard Masséna, 75013 Paris, France.
            Tél : +33 1 70 37 76 61.
          </Block>
          <Block title="Propriété intellectuelle">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos et autres
            éléments graphiques ou multimédias) est protégé par le droit d&apos;auteur. Toute
            reproduction, représentation ou diffusion, en tout ou partie, sans autorisation
            préalable, est strictement interdite.
          </Block>
          <Block title="Responsabilité">
            T.A. TREVYS ADVISORY s&apos;efforce d&apos;assurer la fiabilité et l&apos;actualisation
            des informations diffusées sur ce site, sans pouvoir être tenue responsable des
            erreurs, omissions ou résultats obtenus à la suite de leur utilisation.
          </Block>
        </div>
      </section>
    </>
  );
}
