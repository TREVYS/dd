import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Références",
  description:
    "Trevys accompagne de grands acteurs de la finance et des entreprises de tous secteurs : banque, jeux vidéo, services, santé, association, industrie, immobilier.",
  alternates: { canonical: "/references" },
};

const CLIENTS = [
  "BNP AM", "BPCE", "Natixis", "LCL",
  "Cardif", "La Banque Postale", "Edmond de Rothschild", "Publicis",
];
const SECTORS = [
  "Banque & finance", "Jeux vidéo", "Services", "Santé",
  "Association", "Industrie", "Immobilier",
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: "1rem",
            }}
          >
            {CLIENTS.map((c) => (
              <div
                key={c}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "18px",
                  aspectRatio: "2.4 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  color: "var(--ink3)",
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Vos secteurs</span>
            <h2>Une expertise au service de <em>votre secteur</em></h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
            {SECTORS.map((s) => (
              <span
                key={s}
                style={{
                  padding: ".55rem 1.15rem",
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "100px",
                  fontSize: ".85rem",
                  color: "var(--ink2)",
                }}
              >
                {s}
              </span>
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
