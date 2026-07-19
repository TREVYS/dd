import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notre écosystème",
  description:
    "Un écosystème unique d'entités indépendantes — KLARE STUDIO, WELL&WIZ, URCA, KDL INVEST, PHOENIX, DECA Paris — au service de nos clients, en France et à l'international.",
  alternates: { canonical: "/notre-ecosysteme" },
};

const PARTNERS = [
  { t: "KLARE STUDIO", d: "Solutions de pilotage prédictif pour anticiper les tendances, optimiser la performance et éclairer la décision." },
  { t: "WELL&WIZ", d: "Société de conseil mobilisant une communauté d'experts freelances, de la stratégie à l'opérationnel." },
  { t: "URCA", d: "Commissariat aux comptes : un accompagnement rigoureux pour sécuriser vos processus et vos obligations légales." },
  { t: "KDL INVEST", d: "Recherche de financement : des solutions stratégiques pour faciliter l'accès aux ressources de vos projets." },
  { t: "PHOENIX", d: "Basée à Dakar, notre société d'expertise comptable accompagne votre développement à l'international." },
  { t: "DECA Paris", d: "Partenaire de l'écosystème, au service de la qualité et de la complémentarité de nos expertises." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Notre écosystème</span>
          <h1>Un écosystème d&apos;<em>excellence</em> à votre service</h1>
          <p>
            Nous réunissons des entités indépendantes d&apos;expertise comptable,
            d&apos;audit et de conseil, pour garantir une qualité de service
            exemplaire — en France et à l&apos;international.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos partenaires</span>
            <h2>Des expertises <em>complémentaires</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {PARTNERS.map((p) => (
              <div className="mkt-svc" key={p.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2a4 4 0 100 8 4 4 0 000-8zM4 22a8 8 0 0116 0" /></svg>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un besoin qui dépasse la comptabilité ?</h2>
          <p>Notre écosystème mobilise la bonne expertise, au bon moment, pour votre projet.</p>
          <Link className="btn btn-gold" href="/contact">En parler avec nous</Link>
        </div>
      </section>
    </>
  );
}
