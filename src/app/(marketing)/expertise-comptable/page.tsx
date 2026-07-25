import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { ApprocheArt } from "./approche-art";

export const metadata: Metadata = {
  title: "Expertise comptable",
  description:
    "Expertise comptable, audit, contrôle de gestion et juridique & fiscal : Trevys accompagne entrepreneurs, TPE et PME à chaque étape de la vie de l'entreprise.",
  alternates: { canonical: "/expertise-comptable" },
};

// Fonctionnement : les engagements de méthode pris sur chaque mission.
const METHODE = [
  { t: "Une équipe dédiée", d: "Chaque mission est confiée à une équipe identifiée, qui connaît votre dossier et votre secteur." },
  { t: "Un interlocuteur unique", d: "Un référent durable qui vous répond, coordonne les travaux et engage le cabinet." },
  { t: "Une veille permanente", d: "Fiscalité, comptabilité, réforme de la facturation électronique : nos équipes s'appuient sur une veille technique continue." },
  { t: "Une restitution claire", d: "Chaque mission donne lieu à une présentation personnalisée : vous comprenez nos travaux et ce qu'ils changent pour vous." },
];

// Missions concrètes du pôle.
const MISSIONS = [
  "Business plan & prévisionnel",
  "Collecte et saisie des pièces",
  "Pointage périodique des comptes",
  "Révision de la comptabilité",
  "Analyse des marges",
  "Clôture des comptes",
  "Établissement des comptes annuels",
  "Déclarations fiscales & TVA",
  "Tableaux de bord & reporting",
];

// Ce que le client y gagne.
const BENEFICES = [
  { t: "Sérénité réglementaire", d: "Vos obligations comptables et fiscales sont prises en charge au quotidien, sans mauvaise surprise." },
  { t: "Une information fiable et exploitable", d: "Des chiffres justes, à jour, présentables aux banques et aux tiers." },
  { t: "Une fiscalité maîtrisée", d: "Des options comptables et fiscales étudiées dans votre contexte, pour une juste imposition." },
  { t: "Des risques identifiés", d: "Les risques inhérents à votre activité sont repérés tôt — pour mieux les maîtriser." },
  { t: "Un appui sur vos projets", d: "Création, investissement, croissance : chaque projet mérite une analyse prospective." },
  { t: "Une meilleure gouvernance", d: "Une lecture pragmatique de votre situation financière pour décider en confiance." },
];

// Outils que nous maîtrisons — nous nous adaptons à votre environnement.
// Le logo est chargé depuis le domaine officiel (repli : /uploads/refs/<slug>.png,
// puis le nom en toutes lettres).
const TOOLS = [
  { t: "Tiime", domain: "tiime.fr", slug: "tiime", d: "Comptabilité et facturation en temps réel pour les TPE et indépendants." },
  { t: "Pennylane", domain: "pennylane.com", slug: "pennylane", d: "Plateforme de gestion financière collaborative dirigeant / expert-comptable." },
  { t: "Sage", domain: "sage.com", slug: "sage", d: "Suite de gestion comptable et paie, du poste de travail à l'entreprise." },
  { t: "Cegid", domain: "cegid.com", slug: "cegid", d: "Solutions comptables et fiscales pour cabinets, ETI et grands comptes." },
  { t: "SAP", domain: "sap.com", slug: "sap", d: "ERP de référence des ETI et grands groupes — finance, achats, production." },
  { t: "Oracle", domain: "oracle.com", slug: "oracle", d: "ERP et systèmes financiers pour les organisations complexes et internationales." },
  { t: "Microsoft Dynamics 365", domain: "microsoft.com", slug: "dynamics-365", d: "ERP et CRM Microsoft, intégrés à l'écosystème Office 365." },
  { t: "Power BI", domain: "microsoft.com", slug: "power-bi", d: "Tableaux de bord et reporting décisionnel connectés à vos données." },
];

const POLES = [
  {
    n: "01",
    t: "Expertise comptable",
    d: "Traitement de vos données financières, gestion des déclarations et documents de fin d'année — pour une clôture sereine et optimisée.",
  },
  {
    n: "02",
    t: "Audit",
    d: "Analyse impartiale, optimisation des processus et accompagnement stratégique pour sécuriser votre croissance.",
  },
  {
    n: "03",
    t: "Contrôle de gestion",
    d: "Des outils prédictifs performants et l'accompagnement d'experts pour piloter efficacement votre croissance.",
  },
  {
    n: "04",
    t: "Juridique & Fiscal",
    d: "Nos juristes et fiscalistes soutiennent vos projets et sécurisent vos décisions, au plus près de vos enjeux.",
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Expertise comptable" }]} />
      <ServiceJsonLd
        name="Expertise comptable"
        description="Tenue et révision comptable, établissement des comptes annuels, conseil et accompagnement du dirigeant."
        path="/expertise-comptable"
        serviceType="Expertise comptable"
      />
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Expertise comptable</span>
          <h1>
            À vos côtés à chaque étape de la vie de <em>l&apos;entreprise</em>
          </h1>
          <p>
            Déléguez vos obligations réglementaires, identifiez les risques,
            optimisez vos options comptables et fiscales — avec un
            expert-comptable à votre écoute, qui vous accompagne de manière
            proactive au fur et à mesure que vous vous développez.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Rencontrer un expert-comptable</Link>
            <Link className="btn btn-ghost" href="/contact">Demander un devis</Link>
          </div>
        </div>
      </header>

      {/* Positionnement : un partenaire, pas un simple prestataire */}
      <section className="sec">
        <div className="wrap">
          <div className="mkt-appr">
            <div className="mkt-appr-copy">
              <span className="eyebrow">Notre approche</span>
              <h2>Des solutions adaptées à <em>chaque situation</em></h2>
              <p>
                Nous abordons chacun de vos enjeux sous un angle neuf et
                indépendant, en partenaire : une vision juste, enrichie de la
                multiplicité de nos savoir-faire — expertise comptable, conseil,
                audit, transformation digitale. Au-delà des conseils, notre
                priorité est de vous assurer une sécurité maximale, et de vous
                permettre de prendre du recul dans un cadre sécurisant pour
                mesurer les conséquences des orientations que vous donnez à
                votre entreprise.
              </p>
            </div>
            <ApprocheArt />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le pôle expertise comptable</span>
            <h2>
              Quatre expertises <em>complémentaires</em>
            </h2>
          </div>
          <div className="mkt-svc-grid">
            {POLES.map((p) => (
              <div className="mkt-svc" key={p.n}>
                <span className="num">{p.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4zM4 9h16M9 9v11" />
                  </svg>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnement clair */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre fonctionnement</span>
            <h2>Un fonctionnement <em>clair</em>, pensé pour la qualité</h2>
            <p>
              Une organisation simple et des engagements de méthode, pour un
              haut niveau d&apos;exigence sur chaque mission.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {METHODE.map((m) => (
              <div className="mkt-svc" key={m.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <h3 style={{ fontSize: "1.12rem" }}>{m.t}</h3>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missions & bénéfices */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos missions</span>
            <h2>Du <em>quotidien</em> comptable aux projets qui comptent</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", justifyContent: "center", maxWidth: 860, margin: "0 auto 3rem" }}>
            {MISSIONS.map((m) => (
              <span
                key={m}
                style={{
                  padding: ".55rem 1.1rem",
                  borderRadius: 100,
                  border: "1px solid #F5D9BE",
                  background: "#FFF7F0",
                  fontWeight: 600,
                  fontSize: ".92rem",
                  color: "#5a4330",
                }}
              >
                {m}
              </span>
            ))}
          </div>

          <div className="shead">
            <span className="eyebrow">Vos bénéfices</span>
            <h2>Ce que vous y <em>gagnez</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {BENEFICES.map((b) => (
              <div className="mkt-svc" key={b.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 style={{ fontSize: "1.1rem" }}>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos outils</span>
            <h2>
              Nous nous adaptons à <em>votre organisation</em>
            </h2>
            <p>
              Nous ne vous imposons pas notre outil : nous travaillons dans le
              vôtre. Tiime, Pennylane, Sage, Cegid, Oracle, Power BI… nous
              maîtrisons les principales plateformes du marché et nous connectons
              à votre système d&apos;information existant, sans rupture pour vos
              équipes. L&apos;objectif : fiabiliser vos données et vous rendre du
              temps, quel que soit votre environnement.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {TOOLS.map((tool) => (
              <div className="mkt-svc" key={tool.t}>
                <span className="mkt-tool-badge" aria-hidden="true">{tool.t.slice(0, 2)}</span>
                <h3 style={{ fontSize: "1.12rem" }}>{tool.t}</h3>
                <p>{tool.d}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ textAlign: "center", marginTop: "1.4rem", color: "var(--ink3)", fontSize: ".92rem" }}>
            Un autre outil ? Nous nous y adaptons également — dites-nous lequel.
          </p>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Confiez-nous vos comptes.</h2>
          <p>Reprise de dossier sans rupture et première lecture claire de votre situation.</p>
          <Link className="btn btn-gold" href="/contact">
            Demander un devis
          </Link>
        </div>
      </section>
    </>
  );
}
