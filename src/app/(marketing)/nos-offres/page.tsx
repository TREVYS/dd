import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Nos offres",
  description:
    "Trois niveaux d'accompagnement, une même exigence : TREVYS Essentiel, TREVYS Pilotage, TREVYS Direction — la philosophie de nos offres, adaptée à chaque taille d'entreprise.",
  alternates: { canonical: "/nos-offres" },
};

// Trois niveaux d'accompagnement — philosophie des offres, sans montant :
// la différence n'est pas le nombre de rendez-vous, c'est ce que le
// dirigeant fait de ses chiffres. (Même contenu que la section dédiée de
// /expertise-comptable — cette page en est la version détaillée, hors menu.)
const OFFRES = [
  {
    eyebrow: "Produire",
    t: "TREVYS Essentiel",
    d: "Vos obligations comptables et fiscales sont tenues, contrôlées et déposées dans les délais.",
    quote: "« Je veux déléguer ma comptabilité et être tranquille. »",
    points: [
      "Tenue et révision de la comptabilité",
      "Déclarations fiscales et TVA à jour",
      "Établissement des comptes annuels",
    ],
  },
  {
    eyebrow: "Comprendre",
    t: "TREVYS Pilotage",
    d: "Vos chiffres deviennent lisibles : indicateurs, points de gestion, échéances anticipées.",
    quote: "« Je veux comprendre mes chiffres, pas seulement les connaître. »",
    points: [
      "Tout le contenu de TREVYS Essentiel",
      "Tableaux de bord et indicateurs clés",
      "Points de gestion réguliers avec votre référent",
    ],
  },
  {
    eyebrow: "Décider",
    t: "TREVYS Direction",
    d: "Budget, trésorerie, arbitrages : une direction financière externalisée à vos côtés.",
    quote: "« Je veux quelqu'un à mes côtés pour piloter mon entreprise. »",
    points: [
      "Tout le contenu de TREVYS Pilotage",
      "Construction et suivi budgétaire",
      "Participation aux arbitrages stratégiques",
    ],
    featured: true,
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Nos offres" }]} />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Nos offres</span>
          <h1>
            Trois niveaux d&apos;accompagnement, <em>une même exigence</em>
          </h1>
          <p>
            La différence entre les offres n&apos;est pas le nombre de
            rendez-vous : c&apos;est ce que vous faites de vos chiffres. Chaque
            formule s&apos;adapte à la taille de votre structure et à
            l&apos;étendue de vos besoins — de l&apos;entrepreneur individuel au
            groupe multi-sociétés.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Trouver la bonne formule</Link>
            <Link className="btn btn-ghost" href="/contact">Demander un devis</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-offers">
            {OFFRES.map((o) => (
              <div className={`mkt-offer${o.featured ? " featured" : ""}`} key={o.t}>
                <span className="eyebrow">{o.eyebrow}</span>
                <h3>{o.t}</h3>
                <p>{o.d}</p>
                <ul style={{ margin: "1.1rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: ".5rem" }}>
                  {o.points.map((pt) => (
                    <li key={pt} style={{ display: "flex", gap: ".55rem", alignItems: "flex-start", fontSize: ".88rem", color: o.featured ? "rgba(255,255,255,.85)" : "var(--ink2)" }}>
                      <span aria-hidden="true" style={{ color: o.featured ? "#FBB040" : "#C2410C", fontWeight: 800, flex: "none" }}>✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
                <p className="quote">{o.quote}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ textAlign: "center", marginTop: "1.6rem", color: "var(--ink3)", fontSize: ".92rem", maxWidth: 640, marginInline: "auto" }}>
            Quelle que soit la formule, le principe reste le même : une équipe
            dédiée, un interlocuteur unique, des honoraires forfaitaires connus
            à l&apos;avance. Nous établissons le bon niveau ensemble, lors d&apos;un
            premier échange — sans engagement.
          </p>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Quelle est la bonne formule pour vous ?</h2>
          <p>Trente minutes suffisent pour cadrer votre besoin et vous orienter vers le bon niveau d&apos;accompagnement.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
