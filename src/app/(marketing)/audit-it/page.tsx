import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Audit IT",
  description:
    "Audit des systèmes d'information : gouvernance SI, sécurité et cybersécurité, contrôles généraux informatiques (ITGC), intégrité des données et conformité. Un regard indépendant au service de la fiabilité de vos chiffres.",
  alternates: { canonical: "/audit-it" },
};

const DOMAINS = [
  { n: "01", t: "Gouvernance & pilotage du SI", d: "Organisation de la DSI, alignement SI / métier, gestion de projets et maîtrise des coûts informatiques." },
  { n: "02", t: "Sécurité & cybersécurité", d: "Gestion des accès et des habilitations, protection des données sensibles, exposition aux risques et posture de sécurité." },
  { n: "03", t: "Contrôles généraux informatiques (ITGC)", d: "Revue des contrôles clés qui garantissent la fiabilité des traitements et des données financières." },
  { n: "04", t: "Intégrité & qualité des données", d: "Fiabilité, traçabilité et cohérence des données au cœur de vos processus comptables et de gestion." },
  { n: "05", t: "Continuité & résilience", d: "Sauvegardes, plans de continuité et de reprise, capacité à faire face aux incidents." },
  { n: "06", t: "Conformité & projets (ERP, RFE)", d: "Conformité réglementaire (RGPD), audit des projets structurants et des déploiements ERP ou de facturation électronique." },
];

const WHY = [
  { t: "Indépendance", d: "Un regard extérieur, objectif et sans conflit d'intérêt avec vos éditeurs et prestataires." },
  { t: "Ancrage métier", d: "Nous relions les enjeux techniques à la fiabilité de vos chiffres et à vos obligations." },
  { t: "Recommandations actionnables", d: "Au-delà du constat, un plan d'action priorisé et réaliste, pensé pour être mis en œuvre." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Audit IT" }]} />
      <ServiceJsonLd
        name="Audit des systèmes d'information (Audit IT)"
        description="Audit indépendant du système d'information : gouvernance, sécurité, contrôles généraux informatiques, intégrité des données et conformité."
        path="/audit-it"
        serviceType="Audit informatique"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Audit IT</span>
          <h1>Sécuriser le socle <em>technologique</em> de vos chiffres</h1>
          <p>
            Vos données financières valent ce que vaut le système qui les produit.
            Notre audit IT porte un regard indépendant sur la gouvernance, la
            sécurité et les contrôles de votre système d&apos;information — pour
            fiabiliser vos chiffres et maîtriser vos risques.
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
                  <svg viewBox="0 0 24 24"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V5l8-3z" /></svg>
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
            <span className="eyebrow">Pourquoi Trevys</span>
            <h2>Un audit qui <em>éclaire</em>, pas qui juge</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {WHY.map((c) => (
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
          <h2>Un doute sur la fiabilité de votre SI ?</h2>
          <p>Faisons un premier diagnostic et identifions vos priorités.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
