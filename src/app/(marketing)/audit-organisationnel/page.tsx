import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Audit organisationnel",
  description:
    "Audit organisationnel : processus, contrôle interne, gouvernance et efficacité opérationnelle. Un diagnostic indépendant pour fiabiliser votre organisation et libérer de la performance, notamment sur la fonction finance.",
  alternates: { canonical: "/audit-organisationnel" },
};

const DOMAINS = [
  { n: "01", t: "Processus & efficacité opérationnelle", d: "Cartographie des processus, identification des points de friction, des ressaisies et des tâches à faible valeur." },
  { n: "02", t: "Contrôle interne", d: "Séparation des tâches, points de contrôle, piste d'audit fiable et maîtrise des risques d'erreur ou de fraude." },
  { n: "03", t: "Organisation de la fonction finance", d: "Rôles, responsabilités et dimensionnement des équipes ; qualité et délais de clôture, reporting et pilotage." },
  { n: "04", t: "Gouvernance & responsabilités", d: "Clarté des instances de décision, des circuits de validation et des délégations." },
  { n: "05", t: "Gestion des risques", d: "Cartographie des risques opérationnels, financiers et de conformité, et dispositifs de maîtrise associés." },
  { n: "06", t: "Performance & optimisation des coûts", d: "Indicateurs de pilotage, leviers d'efficience et opportunités d'automatisation." },
];

const APPROACH = [
  { t: "Diagnostic", d: "Entretiens, analyse documentaire et observation du terrain pour comprendre l'existant sans a priori." },
  { t: "Analyse & benchmark", d: "Confrontation aux bonnes pratiques et identification des écarts et des marges de progrès." },
  { t: "Plan de transformation", d: "Recommandations priorisées et feuille de route réaliste, orientée résultats." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Audit organisationnel" }]} />
      <ServiceJsonLd
        name="Audit organisationnel"
        description="Audit indépendant de l'organisation : processus, contrôle interne, gouvernance, fonction finance et efficacité opérationnelle."
        path="/audit-organisationnel"
        serviceType="Audit organisationnel"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Audit organisationnel</span>
          <h1>Révéler la <em>performance</em> cachée de votre organisation</h1>
          <p>
            Processus qui se grippent, contrôles flous, rôles mal définis :
            l&apos;organisation est souvent le premier gisement de performance.
            Notre audit organisationnel pose un diagnostic indépendant et trace
            une feuille de route concrète — avec un ancrage particulier sur la
            fonction finance.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Discuter d&apos;un audit</Link>
            <Link className="btn btn-ghost" href="/consulting">Voir le consulting</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos domaines</span>
            <h2>Ce que nous <em>examinons</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {DOMAINS.map((s) => (
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
            <span className="eyebrow">Notre approche</span>
            <h2>Du <em>diagnostic</em> au plan d&apos;action</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {APPROACH.map((c) => (
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
          <h2>Envie d&apos;y voir plus clair dans votre organisation ?</h2>
          <p>Un premier échange suffit pour cerner vos enjeux et vos priorités.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
