import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notre écosystème",
  description:
    "Le Groupe TREVYS — KLARE STUDIO, WELL&WIZ, URCA, SONAM IA — et ses partenaires PHOENIX et DECA Paris, au service de nos clients en France et à l'international.",
  alternates: { canonical: "/notre-ecosysteme" },
};

// Sociétés du Groupe TREVYS
const GROUP = [
  { t: "KLARE STUDIO", d: "Solutions de pilotage prédictif pour anticiper les tendances, optimiser la performance et éclairer la décision.", u: "https://klare-studio.io/" },
  { t: "WELL&WIZ", d: "Société de conseil mobilisant une communauté d'experts freelances, de la stratégie à l'opérationnel.", u: "https://wellandwiz.com/" },
  { t: "URCA", d: "Commissariat aux comptes : un accompagnement rigoureux pour sécuriser vos processus et vos obligations légales.", u: "http://urca.io/" },
  { t: "SONAM IA", d: "Éditeur de logiciels à base d'intelligence artificielle, au service de la performance et de l'automatisation.", u: "https://wellandwiz-ai-site.vercel.app/" },
];

// Sociétés partenaires
const PARTNERS = [
  { t: "PHOENIX", d: "Société d'expertise comptable basée à Dakar, pour accompagner votre développement à l'international.", u: "https://www.phoenix-conseil.net/" },
  { t: "DECA Paris", d: "Cabinet d'avocats en droit social, partenaire pour sécuriser vos problématiques sociales et RH.", u: "https://www.decaparis.fr/" },
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
            <span className="eyebrow">Le Groupe TREVYS</span>
            <h2>Les <em>sociétés</em> du groupe</h2>
          </div>
          <div className="mkt-svc-grid">
            {GROUP.map((p) => (
              <a className="mkt-svc mkt-svc-link" href={p.u} target="_blank" rel="noopener noreferrer" key={p.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2a4 4 0 100 8 4 4 0 000-8zM4 22a8 8 0 0116 0" /></svg>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="mkt-svc-visit">Visiter le site ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos partenaires</span>
            <h2>Des expertises <em>complémentaires</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {PARTNERS.map((p) => (
              <a className="mkt-svc mkt-svc-link" href={p.u} target="_blank" rel="noopener noreferrer" key={p.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 10-8 0M4 22a8 8 0 0116 0" /></svg>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="mkt-svc-visit">Visiter le site ↗</span>
              </a>
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
