import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

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

const USECASES = [
  { t: "CRM pour avocats", d: "Conception et déploiement d'un CRM métier adapté aux cabinets d'avocats." },
  { t: "CRM pour experts-comptables", d: "Un CRM sur mesure pour la relation client et le pilotage d'un cabinet d'expertise comptable." },
  { t: "Matching de compétences (ESN)", d: "Outil d'appariement des compétences pour optimiser le staffing d'une ESN." },
  { t: "Analyse des compétences & mobilité interne", d: "Outil d'analyse des compétences au service des mobilités internes d'un grand groupe bancaire." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Intelligence artificielle" }]} />
      <ServiceJsonLd
        name="Solutions d'intelligence artificielle"
        description="Conception, développement et déploiement de solutions logicielles et d'IA au service des métiers."
        path="/intelligence-artificielle"
        serviceType="Intelligence artificielle"
      />
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

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos réalisations</span>
            <h2>Des solutions <em>conçues, développées et déployées</em></h2>
            <p>
              Nous participons activement à la conception, au développement et au
              déploiement de solutions logicielles et d&apos;IA pour nos clients.
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)",
              border: "1px solid #F5D9BE",
              borderLeft: "4px solid #F5811F",
              borderRadius: "16px",
              padding: "1.75rem 2rem",
              maxWidth: "860px",
              margin: "0 auto 2.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 .75rem" }}>
              Pourquoi confier ces projets à votre expert-comptable&nbsp;?
            </h3>
            <p style={{ margin: 0 }}>
              Parce que la réussite d&apos;un projet logiciel ou d&apos;IA se joue
              d&apos;abord sur la compréhension du <strong>métier</strong>. C&apos;est
              pourquoi <strong>nous intégrons ces projets en tant qu&apos;expert
              métier</strong>&nbsp;: qui, mieux que votre expert-comptable, connaît vos
              chiffres, vos processus, vos contraintes réglementaires et vos enjeux
              opérationnels&nbsp;? Cette connaissance intime de votre activité nous
              permet de traduire un besoin métier en une solution <strong>juste&nbsp;:
              utile, fiable et réellement adoptée</strong> par vos équipes. Là où
              d&apos;autres livrent une technologie, <strong>nous intervenons au cœur du
              projet comme référent métier</strong> et concevons une réponse ancrée dans
              la réalité de votre entreprise — parce que nous la comprenons de
              l&apos;intérieur.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {USECASES.map((u) => (
              <div className="mkt-svc" key={u.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 013 3 4 4 0 014 4 3 3 0 010 6 4 4 0 01-4 4 3 3 0 01-6 0 4 4 0 01-4-4 3 3 0 010-6 4 4 0 014-4 3 3 0 013-3z" /></svg>
                </div>
                <h3 style={{ fontSize: "1.15rem" }}>{u.t}</h3>
                <p>{u.d}</p>
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
