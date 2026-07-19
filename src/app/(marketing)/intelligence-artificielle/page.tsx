import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Intelligence artificielle",
  description:
    "L'IA au service du conseil chez Trevys : une innovation utile, intégrée uniquement lorsqu'elle crée de la valeur, sous contrôle humain permanent.",
  alternates: { canonical: "/intelligence-artificielle" },
};

const CARDS = [
  { t: "Une valeur d'abord", d: "Aucune technologie pour la technologie : nous l'intégrons uniquement quand elle sert le client." },
  { t: "Contrôle humain", d: "L'expert-comptable valide et arbitre. L'IA propose, le professionnel décide." },
  { t: "Transparence", d: "Des usages explicables et documentés, au service de la qualité et de la sérénité." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Intelligence artificielle</span>
          <h1>Une innovation <em>utile</em>, jamais gadget</h1>
          <p>
            L&apos;innovation n&apos;est pas un objectif, c&apos;est un levier.
            Nous intégrons l&apos;IA lorsqu&apos;elle apporte une réelle valeur —
            dans nos méthodes comme au sein des entreprises que nous
            accompagnons.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-svc-grid">
            <div className="mkt-svc">
              <h3>La technologie ne remplace jamais l&apos;expertise</h3>
              <p>
                Elle permet aux experts de consacrer davantage de temps à ce qui
                compte réellement : le conseil. Nous utilisons l&apos;IA pour
                améliorer nos méthodes, et proposons son intégration chez nos
                clients lorsqu&apos;elle répond à un besoin concret.
              </p>
            </div>
            <div className="mkt-svc">
              <h3>Automatisation & analyse</h3>
              <p>
                Rapprochement, pré-comptabilisation, analyse documentaire,
                détection d&apos;anomalies : nous automatisons les tâches à faible
                valeur ajoutée pour fiabiliser et accélérer le travail.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Un cadre de confiance</span>
            <h2>Une IA <em>maîtrisée</em> et responsable</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {CARDS.map((c) => (
              <div className="mkt-svc" key={c.t}>
                <h3 style={{ fontSize: "1.2rem" }}>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un cas d&apos;usage en tête ?</h2>
          <p>Voyons ensemble si — et comment — l&apos;IA peut créer une valeur concrète pour votre organisation.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
