import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Consulting",
  description:
    "Conseil en transformation, systèmes d'information Finance, ERP, AMOA et facturation électronique : Trevys accompagne PME, ETI et grands groupes.",
  alternates: { canonical: "/consulting" },
};

const SVCS = [
  { n: "01", t: "Systèmes d'information Finance", d: "Cadrage, refonte et pilotage des SI Finance, du besoin métier au déploiement." },
  { n: "02", t: "Projets ERP & AMOA", d: "Assistance à maîtrise d'ouvrage et gestion de projet sur vos programmes ERP structurants." },
  { n: "03", t: "Transformation digitale", d: "Digitalisation des processus et conduite du changement pour embarquer les équipes." },
  { n: "04", t: "Facturation électronique", d: "Accompagnement de bout en bout de la réforme, pour les DAF et les grands groupes." },
];

const TAGS = [
  "Systèmes d'information Finance", "Projets ERP", "Gestion de projet", "AMOA",
  "Transformation digitale", "Conduite du changement", "Gouvernance des processus",
  "Optimisation des organisations", "Réforme de la facturation électronique",
];

// Équipe de consultants. Ajoutez une photo en renseignant `img`
// (ex. "/brand/consultants/franck.jpg") — sinon un monogramme s'affiche.
const CONSULTANTS = [
  { n: "Franck", r: "Manager de transition — Direction financière", img: "" },
  { n: "Patrick", r: "Direction financière & performance", img: "" },
];

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Consulting</span>
          <h1>Accompagner les <em>transformations</em> des organisations</h1>
          <p>
            PME, ETI et grands groupes font face à des transformations majeures.
            Notre force : faire le lien entre les enjeux métiers, les contraintes
            réglementaires et les solutions technologiques.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-svc-grid">
            {SVCS.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos interventions</span>
            <h2>Là où nous créons de la <em>valeur</em></h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
            {TAGS.map((t) => (
              <span
                key={t}
                style={{
                  padding: ".55rem 1.15rem",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "100px",
                  fontSize: ".85rem",
                  color: "var(--ink2)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre équipe</span>
            <h2>Une <em>équipe</em> de consultants à vos côtés</h2>
            <p>
              Derrière chaque mission, des experts aux parcours complémentaires —
              finance, systèmes d&apos;information et conduite du changement — pour
              répondre concrètement à vos enjeux métiers.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "1.25rem",
            }}
          >
            {CONSULTANTS.map((c) => (
              <div
                key={c.n}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "18px",
                  padding: "1.75rem 1.5rem",
                  textAlign: "center",
                  transition: "transform .2s, box-shadow .2s",
                }}
              >
                <div
                  style={{
                    width: "84px",
                    height: "84px",
                    margin: "0 auto .9rem",
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    background: c.img
                      ? `center/cover no-repeat url(${c.img})`
                      : "linear-gradient(140deg,#FBB040,#C2410C)",
                  }}
                >
                  {!c.img && initials(c.n)}
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{c.n}</div>
                <div style={{ color: "var(--ink2)", fontSize: ".9rem", marginTop: ".35rem" }}>
                  {c.r}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un projet de transformation ?</h2>
          <p>Parlons de vos enjeux métiers, réglementaires et technologiques.</p>
          <Link className="btn btn-gold" href="/contact">Échanger avec un consultant</Link>
        </div>
      </section>
    </>
  );
}
