import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { BreadcrumbJsonLd, ServiceJsonLd } from "./seo-jsonld";
import { FaqSection } from "./faq-section";
import type { LocalPage } from "@/lib/local-pages";
import { localPagePath } from "@/lib/local-pages";

const FAMILLE_LABEL: Record<LocalPage["famille"], { nom: string; path: string }> = {
  "expert-comptable": { nom: "Expertise comptable", path: "/expertise-comptable" },
  conseil: { nom: "Conseil", path: "/consulting" },
  situation: { nom: "Votre situation", path: "/contact" },
};

// Gabarit des pages « métier + localisation » et « situation ». Contenu propre
// à chaque page (src/lib/local-pages.ts) ; habillage aux codes du site :
// tuiles numérotées, parcours par étapes, chiffres clés, bandeau orange.
export function LocalPageView({ page }: { page: LocalPage }) {
  const parent = FAMILLE_LABEL[page.famille];
  const path = localPagePath(page);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: parent.nom, path: parent.path },
          { name: page.h1 },
        ]}
      />
      <ServiceJsonLd
        name={page.h1}
        description={page.description}
        path={path}
        serviceType={parent.nom}
      />
      {/* Zone couverte : utile aux recherches locales. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${SITE_URL}${path}`,
            name: page.title,
            description: page.description,
            about: { "@id": `${SITE_URL}/#organization` },
            mainContentOfPage: { "@type": "WebPageElement", about: page.lieu },
          }),
        }}
      />

      {/* En-tête */}
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">{parent.nom} · {page.lieu}</span>
          <h1>{page.h1}</h1>
          <p>{page.chapeau}</p>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
            <Link className="btn btn-ghost" href="/contact">Nous écrire</Link>
          </div>
        </div>
      </header>

      {/* Chiffres clés */}
      {page.chiffres && page.chiffres.length > 0 && (
        <section className="sec" style={{ paddingTop: 0, paddingBottom: "1.5rem" }}>
          <div className="wrap">
            <div className="mkt-loc-stats">
              {page.chiffres.map((c) => (
                <div key={c.legende}>
                  <b>{c.valeur}</b>
                  <span>{c.legende}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Atouts : tuiles numérotées, dans le thème du site */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Ce que nous apportons</span>
            <h2>Notre <em>engagement</em></h2>
          </div>
          <div className="mkt-loc-grid">
            {page.atouts.map((a, i) => (
              <div key={a.titre} className="mkt-loc-card">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{a.titre}</h3>
                <p>{a.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours : les étapes, reliées visuellement */}
      {page.etapes && page.etapes.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow">Comment ça se passe</span>
              <h2>Un parcours <em>balisé</em></h2>
            </div>
            <ol className="mkt-steps">
              {page.etapes.map((e, i) => (
                <li key={e.titre}>
                  <span className="dot">{i + 1}</span>
                  <h3>{e.titre}</h3>
                  <p>{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <FaqSection
        items={page.faq}
        path={path}
        intro={<h2>Vos questions, <em>nos réponses</em></h2>}
      />

      {/* Maillage interne */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Pour aller plus loin</span>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.1rem" }}>
            {page.liens.map((l) => (
              <Link key={l.href} className="btn btn-ghost btn-sm" href={l.href}>{l.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bandeau orange, signature du site */}
      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Parlons de votre situation.</h2>
          <p>
            Un premier échange de trente minutes suffit à y voir clair — sans engagement,
            sur place rue Le Nôtre ou en visioconférence.
          </p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>

      {/* Informations pratiques, en tuiles */}
      <section className="sec" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
        <div className="wrap">
          <div className="mkt-loc-infos">
            <div>
              <b>1 rue Le Nôtre, Paris 16ᵉ</b>
              <span>À deux pas du Trocadéro — sur place ou en visioconférence</span>
            </div>
            <div>
              <b>Ordre des Experts-Comptables</b>
              <span>Cabinet inscrit — Paris Île-de-France</span>
            </div>
            <div>
              <b>Du lundi au vendredi</b>
              <span>De 9 h à 19 h, sur rendez-vous</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
