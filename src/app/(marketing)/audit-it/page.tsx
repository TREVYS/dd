import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Audit IT",
  description:
    "Audit IT : renfort aux commissaires aux comptes sur les contrôles généraux informatiques, audit de la Piste d'Audit Fiable côté systèmes, revue des droits et habilitations — pour fiabiliser vos systèmes et sécuriser la certification de vos comptes.",
  alternates: { canonical: "/audit-it" },
};

const DOMAINES = [
  {
    t: "Renfort aux commissaires aux comptes",
    d: "Intervention en appui des équipes d'audit légal sur les contrôles généraux informatiques (ITGC) nécessaires à la certification des comptes, sur les systèmes qui portent l'information financière.",
    ico: "M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zM23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  },
  {
    t: "Audit de la Piste d'Audit Fiable (PAF)",
    d: "Vérification, côté systèmes, que les applications garantissent authenticité de l'origine, intégrité du contenu et lisibilité des factures et des pièces justificatives, de l'émission à l'archivage.",
    ico: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  },
  {
    t: "Contrôles généraux informatiques (ITGC)",
    d: "Gestion des accès et des habilitations, gestion des changements applicatifs, exploitation et sauvegardes : les contrôles qui sous-tendent la fiabilité de tout système d'information financier.",
    ico: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z",
  },
  {
    t: "Revue des droits et habilitations",
    d: "Cartographie des accès aux systèmes financiers, détection des cumuls de droits incompatibles et des comptes à privilèges mal maîtrisés, recommandations de séparation des tâches.",
    ico: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  },
  {
    t: "Audit des interfaces et flux inter-applicatifs",
    d: "Fiabilité et traçabilité des données qui transitent entre vos systèmes (ERP, outils métier, plateformes de facturation) — un maillon souvent négligé, pourtant critique pour la qualité de l'information financière.",
    ico: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  },
  {
    t: "Audit de projets IT",
    d: "Revue de la gouvernance et des points de contrôle d'un projet système en cours : jalons de recette, tests de migration, plans de bascule — pour sécuriser un déploiement avant qu'il n'impacte vos comptes.",
    ico: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
];

const EXEMPLES = [
  {
    t: "Renfort d'équipes d'audit légal",
    d: "Pour des cabinets de commissariat aux comptes, en appui sur le volet informatique de missions de certification des comptes : revue des contrôles généraux informatiques, tests sur les accès et la séparation des tâches dans les systèmes financiers.",
  },
  {
    t: "Audit de PAF à l'approche de la réforme",
    d: "Pour des entreprises de tailles et de secteurs variés, audit de la piste d'audit fiable côté systèmes à l'approche de leurs échéances de facturation électronique, afin d'identifier les écarts avant qu'un contrôle fiscal ne les révèle.",
  },
  {
    t: "Audit ITGC lors d'une migration ERP",
    d: "Pour des groupes en cours de migration de système d'information Finance, revue des contrôles généraux informatiques et des droits d'accès sur le nouvel outil, avant et après la bascule en production.",
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Audit IT" }]} />
      <ServiceJsonLd
        name="Audit IT"
        description="Audit IT : contrôles généraux informatiques, renfort aux commissaires aux comptes, audit de la Piste d'Audit Fiable côté systèmes, revue des droits et habilitations."
        path="/audit-it"
        serviceType="Audit IT"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Audit IT</span>
          <h1>Fiabiliser vos <em>systèmes</em>, sécuriser vos comptes</h1>
          <p>
            Vos comptes s&apos;appuient sur vos systèmes d&apos;information : accès,
            paramétrages, interfaces, traçabilité. Notre audit IT intervient
            sur ce terrain — en renfort des commissaires aux comptes comme en
            direct auprès des directions financières — pour vérifier que les
            systèmes garantissent réellement la fiabilité qu&apos;on leur prête.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Discuter d&apos;un audit IT</Link>
            <Link className="btn btn-ghost" href="/audit-organisationnel">Voir l&apos;audit organisationnel</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos domaines</span>
            <h2>Ce que nous <em>auditons</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {DOMAINES.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d={s.ico} /></svg>
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
            <span className="eyebrow">Exemples d&apos;intervention</span>
            <h2>Des missions <em>concrètes</em></h2>
            <p>
              Nos clients étant tenus à la confidentialité, nous ne citons pas
              leurs noms ici — voici le type de missions que nous menons
              régulièrement.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {EXEMPLES.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <h3 style={{ fontSize: "1.15rem" }}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre approche</span>
            <h2>Une équipe qui parle <em>les deux langues</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.2rem" }}>Comptable et systèmes</h3>
              <p>Nos auditeurs IT connaissent aussi la comptabilité : ils savent pourquoi tel accès mal cloisonné ou tel paramétrage de workflow représente un vrai risque de certification, pas seulement une non-conformité théorique.</p>
            </div>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.2rem" }}>Indépendants et directs</h3>
              <p>En renfort d&apos;un commissaire aux comptes ou en direct pour une direction financière, nous livrons des constats factuels et des recommandations priorisées, sans enjeu commercial sur les outils audités.</p>
            </div>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.2rem" }}>Un rapport exploitable</h3>
              <p>Au-delà du constat, un plan d&apos;action hiérarchisé — ce qui doit être corrigé avant la prochaine clôture, et ce qui peut s&apos;inscrire dans une trajectoire plus longue.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un audit IT à planifier ?</h2>
          <p>Avant une clôture, une migration ou un contrôle fiscal : parlons de votre contexte.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
