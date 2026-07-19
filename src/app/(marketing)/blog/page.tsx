import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Analyses, guides et décryptages de Trevys sur la facturation électronique, la fiscalité, la comptabilité et l'innovation.",
  alternates: { canonical: "/blog" },
};

const POSTS = [
  { d: "30 décembre 2025", c: "Actualité", t: "Bilan 2025 : les tendances « techno et comptables »", e: "Une étude de l'Ordre des Experts-Comptables et de DAF-Mag dresse le tableau des innovations qui irriguent nos métiers." },
  { d: "4 septembre 2025", c: "Facturation électronique", t: "Réforme de la facturation électronique : téléchargez votre guide", e: "Notre guide pratique pour aborder la réforme sereinement, étape par étape." },
  { d: "29 août 2025", c: "Fiscalité", t: "TVA déductible : ce que toute entreprise doit savoir", e: "Collectée, déductible, crédit de TVA : l'essentiel pour ne plus se tromper." },
  { d: "28 août 2025", c: "Fiscalité", t: "Crédit d'impôt jeux vidéo : un levier stratégique pour les studios", e: "Un dispositif clé pour financer la création vidéoludique française." },
  { d: "27 août 2025", c: "Comptabilité", t: "Pièces justificatives : pourquoi le relevé bancaire ne suffit pas", e: "L'erreur qu'on voit trop souvent en cabinet — et comment l'éviter." },
  { d: "7 août 2025", c: "Facturation électronique", t: "Réforme de la facturation électronique : cartographier avant d'agir", e: "Aucun projet de conformité ne tient sans une cartographie claire de l'existant." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Le journal</span>
          <h1>Nous <em>décryptons</em> l&apos;actu du chiffre et de la réforme</h1>
          <p>
            Analyses, guides pratiques et décryptages de nos équipes sur la
            facturation électronique, la fiscalité, la comptabilité et
            l&apos;innovation.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
              gap: "1.6rem",
            }}
          >
            {POSTS.map((p) => (
              <article
                key={p.t}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r)",
                  overflow: "hidden",
                }}
              >
                <div style={{ height: 150, background: "linear-gradient(140deg,#8B5CF6,#6D28D9 55%,#C81FD4)" }} />
                <div style={{ padding: "1.7rem" }}>
                  <span style={{ fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--violet)", fontWeight: 700 }}>
                    {p.c}
                  </span>
                  <h3 style={{ fontSize: "1.16rem", lineHeight: 1.25, margin: ".9rem 0 .7rem" }}>{p.t}</h3>
                  <p style={{ fontSize: ".86rem", color: "var(--ink2)", lineHeight: 1.6, marginBottom: "1.1rem" }}>{p.e}</p>
                  <div style={{ fontSize: ".75rem", color: "var(--ink3)" }}>{p.d}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
