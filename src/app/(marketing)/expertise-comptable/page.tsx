import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Expertise comptable",
  description:
    "Expertise comptable, audit, contrôle de gestion et juridique & fiscal : Trevys accompagne entrepreneurs, TPE et PME à chaque étape de la vie de l'entreprise.",
  alternates: { canonical: "/expertise-comptable" },
};

// Outils que nous maîtrisons — nous nous adaptons à votre environnement.
const TOOLS = [
  { t: "Tiime", d: "Comptabilité et facturation en temps réel pour les TPE et indépendants." },
  { t: "Pennylane", d: "Plateforme de gestion financière collaborative dirigeant / expert-comptable." },
  { t: "Sage", d: "Suite de gestion comptable et paie, du poste de travail à l'entreprise." },
  { t: "Cegid", d: "Solutions comptables et fiscales pour cabinets, ETI et grands comptes." },
  { t: "Oracle", d: "ERP et systèmes financiers pour les organisations complexes et internationales." },
  { t: "Power BI", d: "Tableaux de bord et reporting décisionnel connectés à vos données." },
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
            Nous accompagnons les entrepreneurs, les TPE et les PME — de la
            création au développement, de la conformité au pilotage. Et nous
            allons plus loin, en intégrant les outils digitaux pour une expertise
            plus fluide et tournée vers le conseil.
          </p>
        </div>
      </header>

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
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2l3 3-3 3-3-3 3-3zM4 12l3-3 3 3-3 3-3-3zM14 12l3-3 3 3-3 3-3-3zM12 14l3 3-3 3-3-3 3-3z" /></svg>
                </div>
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
