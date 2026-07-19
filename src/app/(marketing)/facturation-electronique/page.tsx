import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facturation électronique",
  description:
    "Trevys accompagne toutes les dimensions de la réforme de la facturation électronique : analyse d'impact, organisation, choix des solutions, conduite du changement et déploiement.",
  alternates: { canonical: "/facturation-electronique" },
};

const STEPS = [
  { n: "01", t: "Analyse d'impact", d: "Cartographie de vos flux de facturation et évaluation des impacts sur votre organisation et vos outils." },
  { n: "02", t: "Organisation & gouvernance", d: "Définition de la cible, des rôles et de la gouvernance des processus de facturation." },
  { n: "03", t: "Choix des solutions", d: "Sélection de la plateforme adaptée à votre volumétrie et votre système d'information." },
  { n: "04", t: "Conduite du changement", d: "Formation des équipes et déploiement opérationnel, jusqu'aux premières échéances." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Facturation électronique</span>
          <h1>Une expertise <em>reconnue</em> sur la réforme</h1>
          <p>
            La facturation électronique est l&apos;une des plus importantes
            transformations des entreprises françaises. Trevys en couvre chaque
            dimension, pour nos clients en expertise comptable comme pour les
            directions financières et grands groupes accompagnés en consulting.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre accompagnement</span>
            <h2>Toutes les dimensions de la <em>réforme</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {STEPS.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6" /></svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Où en êtes-vous de la réforme ?</h2>
          <p>Faisons le point sur votre niveau de préparation et bâtissons votre feuille de route.</p>
          <Link className="btn btn-gold" href="/contact">Faire le point</Link>
        </div>
      </section>
    </>
  );
}
