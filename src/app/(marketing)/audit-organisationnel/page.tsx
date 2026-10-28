import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { FaqSection } from "../_components/faq-section";

export const metadata: Metadata = {
  title: "Audit opérationnel & IT",
  description:
    "Audit opérationnel & IT : processus, contrôle interne, contrôles généraux informatiques, renfort aux commissaires aux comptes et audit de la Piste d'Audit Fiable (PAF) — un sujet clé de la réforme de la facturation électronique souvent négligé. Diagnostic indépendant pour fiabiliser votre organisation et sécuriser votre conformité.",
  alternates: { canonical: "/audit-organisationnel", languages: { en: "https://www.trevys.fr/en/organizational-audit" } },
};

const DOMAINS = [
  { n: "01", t: "Processus & efficacité opérationnelle", d: "Cartographie des processus, identification des points de friction, des ressaisies et des tâches à faible valeur." },
  { n: "02", t: "Contrôle interne", d: "Séparation des tâches, points de contrôle, piste d'audit fiable et maîtrise des risques d'erreur ou de fraude." },
  { n: "03", t: "Organisation de la fonction finance", d: "Rôles, responsabilités et dimensionnement des équipes ; qualité et délais de clôture, reporting et pilotage." },
  { n: "04", t: "Gouvernance & responsabilités", d: "Clarté des instances de décision, des circuits de validation et des délégations." },
  { n: "05", t: "Gestion des risques", d: "Cartographie des risques opérationnels, financiers et de conformité, et dispositifs de maîtrise associés." },
  { n: "06", t: "Performance & optimisation des coûts", d: "Indicateurs de pilotage, leviers d'efficience et opportunités d'automatisation." },
];

const PAF = [
  { t: "Documentation des processus", d: "Formalisation des circuits achats (P2P) et ventes (O2C) et des contrôles associés — la base d'une piste d'audit fiable." },
  { t: "Traçabilité de bout en bout", d: "Le lien continu et vérifiable entre commande, livraison/exécution, facture et paiement." },
  { t: "Points de contrôle & séparation des tâches", d: "Les contrôles clés qui garantissent qu'aucune facture ne s'écarte de la réalité de l'opération." },
  { t: "Authenticité, intégrité, lisibilité", d: "Les trois exigences légales sur chaque facture, de l'émission jusqu'à l'archivage." },
  { t: "Archivage à valeur probante", d: "Conservation sécurisée et opposable des factures et des pièces justificatives (SAE)." },
  { t: "Préparation au contrôle fiscal", d: "Une PAF documentée et présentable, pour aborder un contrôle sereinement." },
];

const IT_DOMAINS = [
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

const IT_EXAMPLES = [
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

const APPROACH = [
  { t: "Diagnostic", d: "Entretiens, analyse documentaire et observation du terrain pour comprendre l'existant sans a priori." },
  { t: "Analyse & benchmark", d: "Confrontation aux bonnes pratiques et identification des écarts et des marges de progrès." },
  { t: "Plan de transformation", d: "Recommandations priorisées et feuille de route réaliste, orientée résultats." },
];

const FAQ = [
  { q: "Qu'est-ce qu'un audit opérationnel et IT ?", a: "Un diagnostic indépendant de l'organisation (processus, contrôle interne, gouvernance) et des systèmes d'information qui portent l'information financière (accès, paramétrages, interfaces, traçabilité), suivi d'un plan d'action priorisé." },
  { q: "Intervenez-vous en renfort des commissaires aux comptes ?", a: "Oui. Nous appuyons les équipes d'audit légal sur le volet informatique des missions de certification des comptes, notamment la revue des contrôles généraux informatiques (ITGC) et des droits d'accès." },
  { q: "Que sont les contrôles généraux informatiques (ITGC) ?", a: "Ce sont les contrôles qui garantissent la fiabilité d'un système d'information : gestion des accès et des habilitations, gestion des changements applicatifs, exploitation et sauvegardes." },
  { q: "Pourquoi auditer sa Piste d'Audit Fiable avec la facturation électronique ?", a: "La Piste d'Audit Fiable (art. 289 VII du CGI) reste exigée pour tous les flux qui ne sont pas des factures électroniques structurées. L'auditer avant les échéances de la réforme permet de corriger les écarts avant qu'un contrôle fiscal ne les révèle." },
  { q: "Qui dirige les missions d'audit IT ?", a: "Chaque mission est dirigée par un associé du cabinet à la fois expert-comptable, commissaire aux comptes et data analyste, qui mobilise selon le périmètre des profils pluridisciplinaires." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Audit opérationnel & IT" }]} />
      <ServiceJsonLd
        name="Audit opérationnel & IT"
        description="Audit indépendant de l'organisation : processus, contrôle interne, gouvernance, fonction finance et efficacité opérationnelle."
        path="/audit-organisationnel"
        serviceType="Audit opérationnel et IT"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Audit opérationnel &amp; IT</span>
          <h1>Fiabiliser votre <em>organisation</em> et vos <em>systèmes</em></h1>
          <p>
            Processus qui se grippent, contrôles flous, accès mal cloisonnés,
            interfaces fragiles : l&apos;organisation et les systèmes
            d&apos;information sont les deux piliers de la fiabilité de vos
            comptes. Notre audit opérationnel &amp; IT pose un diagnostic
            indépendant et trace une feuille de route concrète — avec un ancrage
            particulier sur la fonction finance.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Discuter d&apos;un audit</Link>
            <a className="btn btn-ghost" href="#audit-it">Voir l&apos;audit IT</a>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Audit opérationnel</span>
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

      {/* Pavé Piste d'Audit Fiable */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le sujet que beaucoup oublient</span>
            <h2>Audit de la <em>Piste d&apos;Audit Fiable</em> (PAF)</h2>
            <p>
              La Piste d&apos;Audit Fiable est une obligation légale (art. 289 VII du CGI) :
              un ensemble documenté de contrôles qui établit, pour chaque facture, le lien
              avec la réalité de l&apos;opération — et garantit l&apos;authenticité de
              l&apos;origine, l&apos;intégrité du contenu et la lisibilité, de l&apos;émission
              à l&apos;archivage.
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)",
              border: "1px solid #F5D9BE",
              borderLeft: "4px solid #F5811F",
              borderRadius: "16px",
              padding: "1.6rem 1.9rem",
              maxWidth: "880px",
              margin: "0 auto 2.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 .7rem" }}>
              Facturation électronique : un enjeu sous-estimé
            </h3>
            <p style={{ margin: 0 }}>
              Beaucoup pensent qu&apos;avec la facture électronique, la PAF disparaît.{" "}
              <strong>C&apos;est faux.</strong>{" "}Elle reste exigée pour tous les flux qui ne
              sont pas des factures électroniques structurées (factures papier ou PDF, ventes
              B2C, opérations internationales relevant de l&apos;e-reporting), et
              l&apos;administration s&apos;appuie dessus lors d&apos;un contrôle. Négliger sa
              piste d&apos;audit, c&apos;est s&apos;exposer à un risque fiscal réel — au moment
              même où les processus de facturation sont bouleversés par la réforme.
            </p>
          </div>

          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PAF.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <h3 style={{ fontSize: "1.12rem" }}>{s.t}</h3>
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

      <section className="sec band" id="audit-it" style={{ scrollMarginTop: "100px" }}>
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Audit IT</span>
            <h2>Fiabiliser vos <em>systèmes</em>, sécuriser vos comptes</h2>
            <p>Vos comptes s&apos;appuient sur vos systèmes d&apos;information : accès, paramétrages, interfaces, traçabilité. Nous intervenons sur ce terrain — en renfort des commissaires aux comptes comme en direct auprès des directions financières.</p>
          </div>
          <div className="mkt-svc-grid">
            {IT_DOMAINS.map((s) => (
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

      <section className="sec">
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
            {IT_EXAMPLES.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <h3 style={{ fontSize: "1.15rem" }}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Audit IT — notre approche</span>
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

          <div
            style={{
              background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)",
              border: "1px solid #F5D9BE",
              borderLeft: "4px solid #F5811F",
              borderRadius: "16px",
              padding: "1.6rem 1.9rem",
              maxWidth: "880px",
              margin: "2.2rem auto 0",
            }}
          >
            <h3 style={{ fontSize: "1.15rem", margin: "0 0 .7rem" }}>
              Un pilotage à un seul niveau de responsabilité
            </h3>
            <p style={{ margin: 0, color: "var(--ink2)", lineHeight: 1.75 }}>
              Nous savons mobiliser des profils pluridisciplinaires selon le
              périmètre de la mission. Mais chaque audit IT est dirigé par un
              associé du cabinet qui cumule lui-même les trois regards
              nécessaires : <strong>expert-comptable</strong>,{" "}
              <strong>commissaire aux comptes</strong> et{" "}
              <strong>data analyste</strong>. Un seul interlocuteur porte la
              responsabilité de la mission, du cadrage jusqu&apos;au rapport final.
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={FAQ} path="/audit-organisationnel" intro={<h2>Vos questions sur <em>l'audit opérationnel &amp; IT</em></h2>} />

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Envie d&apos;y voir plus clair dans votre organisation et vos systèmes ?</h2>
          <p>Un premier échange suffit pour cerner vos enjeux et vos priorités.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
