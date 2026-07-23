import type { Metadata } from "next";
import Link from "next/link";
import { RefLogo } from "./ref-logo";
import { slugify } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Références",
  description:
    "Trevys accompagne de grands acteurs de la finance et des entreprises de tous secteurs : banque, jeux vidéo, services, santé, association, industrie, immobilier.",
  alternates: { canonical: "/references" },
};

// name + domaine officiel (pour récupérer le vrai logo). Sans domaine, on
// tente un logo importé (/uploads/refs/<slug>.png), sinon le nom en toutes lettres.
const CLIENTS: { name: string; domain?: string }[] = [
  { name: "AG2R La Mondiale", domain: "ag2rlamondiale.fr" },
  { name: "Banque Populaire", domain: "banquepopulaire.fr" },
  { name: "Caisse d'Épargne", domain: "caisse-epargne.fr" },
  { name: "BPCE Groupe", domain: "bpce.fr" },
  { name: "BPCE SI", domain: "bpce.fr" },
  { name: "BRED", domain: "bred.fr" },
  { name: "BNP AM", domain: "bnpparibas-am.com" },
  { name: "Natixis", domain: "natixis.com" },
  { name: "LCL", domain: "lcl.fr" },
  { name: "La Banque Postale", domain: "labanquepostale.fr" },
  { name: "Cardif", domain: "bnpparibascardif.com" },
  { name: "Oney", domain: "oney.com" },
  { name: "Edmond de Rothschild", domain: "edmond-de-rothschild.com" },
  { name: "Roole", domain: "roole.fr" },
  { name: "Sportfive", domain: "sportfive.com" },
  { name: "Publicis", domain: "publicis.com" },
  { name: "Lapeyre", domain: "lapeyre.fr" },
  { name: "Handy'Up" },
  { name: "Leano" },
  { name: "Jeux&Co" },
  { name: "Ekin" },
  { name: "Ulas Istanbul" },
  { name: "Jaji" },
];
const SECTORS = [
  { t: "Banque & Assurance", u: "Direction de programme RFE, manager de transition, gestion de projet IT / Finance." },
  { t: "Jeux vidéo", u: "Crédit d'impôt jeux vidéo, structuration financière et expertise comptable des studios." },
  { t: "Services", u: "Expertise comptable, reporting et pilotage de la performance." },
  { t: "Santé", u: "Expertise comptable, fiscalité maîtrisée et accompagnement des professions libérales." },
  { t: "Association", u: "Comptabilité, obligations spécifiques et sécurisation des comptes." },
  { t: "Industrie", u: "Contrôle de gestion, reporting et transformation des systèmes d'information Finance." },
  { t: "Immobilier", u: "SCI, fiscalité immobilière et structuration patrimoniale." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Références</span>
          <h1>La confiance de grands <em>acteurs</em> de la finance</h1>
          <p>
            Banques, groupes, studios, PME : nos équipes interviennent aux côtés
            d&apos;organisations exigeantes, en expertise comptable comme en
            consulting auprès des directions financières.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Ils nous font confiance</span>
            <h2>Quelques <em>références</em></h2>
          </div>
          <div className="mkt-refs-grid">
            {CLIENTS.map((c) => {
              const slug = slugify(c.name);
              const srcs = [
                ...(c.domain ? [`https://logo.clearbit.com/${c.domain}?size=200`] : []),
                `/uploads/refs/${slug}.png`,
              ];
              return (
                <div className="mkt-ref-card" key={c.name}>
                  <RefLogo name={c.name} srcs={srcs} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Vos secteurs</span>
            <h2>Une expertise au service de <em>votre secteur</em></h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: "1.2rem",
            }}
          >
            {SECTORS.map((s) => (
              <div
                key={s.t}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  padding: "1.6rem 1.7rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    color: "var(--ink)",
                    fontSize: "1.08rem",
                    marginBottom: ".55rem",
                  }}
                >
                  {s.t}
                </div>
                <div style={{ fontSize: ".88rem", color: "var(--ink2)", lineHeight: 1.55 }}>
                  {s.u}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Et si vous étiez la prochaine référence ?</h2>
          <p>Rejoignez les organisations qui ont fait de leur comptabilité un avantage.</p>
          <Link className="btn btn-gold" href="/contact">Travailler avec nous</Link>
        </div>
      </section>
    </>
  );
}
