import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { SilhouetteAvatar } from "../_components/silhouette-avatar";
import { CONSULTANTS } from "@/lib/consultants";

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

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Conseil" }]} />
      <ServiceJsonLd
        name="Conseil & transformation"
        description="Conseil en transformation, systèmes d'information Finance, ERP, AMOA et facturation électronique."
        path="/consulting"
        serviceType="Conseil en management"
      />
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
          <div className="shead mkt-team-head">
            <span className="eyebrow">Notre équipe</span>
            <h2>Une <em>équipe</em> de consultants à vos côtés</h2>
            <p className="mkt-team-lead">
              Derrière chaque mission, des experts aux parcours complémentaires —
              finance, systèmes d&apos;information, contrôle de gestion, RH,
              cybersécurité et conduite du changement. Une équipe pluridisciplinaire,
              mobilisable au plus près de vos enjeux.
            </p>
          </div>
          <div className="mkt-team">
            {CONSULTANTS.map((c) => (
              <div className="mkt-team-card mkt-consultant" key={c.slug}>
                <SilhouetteAvatar seed={c.slug} label={c.firstName} />
                <div className="mkt-team-body">
                  <div className="nm">{c.firstName}</div>
                  <div className="rl">{c.role}</div>
                  <div className="mkt-team-foot">
                    <Link className="mkt-consultant-more mkt-stretch" href={`/consulting/${c.slug}`}>En savoir plus →</Link>
                    <Link className="mkt-rdv-ic" href="/rendez-vous" aria-label={`Prendre rendez-vous — ${c.firstName}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <span>Rdv</span>
                    </Link>
                  </div>
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
