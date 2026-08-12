import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { BreadcrumbJsonLd, ServiceJsonLd } from "./seo-jsonld";
import { FaqSection } from "./faq-section";
import type { LocalPage } from "@/lib/local-pages";
import { localPagePath } from "@/lib/local-pages";

const FAMILLE_LABEL: Record<LocalPage["famille"], { nom: string; path: string }> = {
  "expert-comptable": { nom: "Expertise comptable", path: "/expertise-comptable" },
  conseil: { nom: "Conseil", path: "/consulting" },
};

// Gabarit des pages « métier + localisation ». Contenu propre à chaque page
// (défini dans src/lib/local-pages.ts) : pas de texte dupliqué d'une page à
// l'autre, ce que Google sanctionnerait.
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

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">{parent.nom} · {page.lieu}</p>
          <h1 style={{ fontSize: "2.1rem", lineHeight: 1.2, margin: ".6rem 0 1.2rem" }}>{page.h1}</h1>
          <p style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem" }}>{page.chapeau}</p>

          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", margin: "2rem 0 0" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
            <Link className="btn btn-ghost" href="/contact">Nous écrire</Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--bg-alt, #faf7f2)" }}>
        <div className="wrap" style={{ maxWidth: 980 }}>
          <div className="mkt-loc-grid">
            {page.atouts.map((a) => (
              <div key={a.titre} className="mkt-loc-card">
                <h2>{a.titre}</h2>
                <p>{a.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection
        items={page.faq}
        path={path}
        intro={<h2>Vos questions, <em>nos réponses</em></h2>}
      />

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Pour aller plus loin</p>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", marginTop: "1rem" }}>
            {page.liens.map((l) => (
              <Link key={l.href} className="btn btn-ghost btn-sm" href={l.href}>{l.label}</Link>
            ))}
          </div>
          <p style={{ color: "var(--ink3)", fontSize: ".88rem", lineHeight: 1.7, marginTop: "2rem" }}>
            T.A. Trevys Advisory — 1 rue Le Nôtre, 75116 Paris. Cabinet inscrit à l&apos;Ordre des
            Experts-Comptables de Paris Île-de-France. Rendez-vous sur place ou en visioconférence,
            du lundi au vendredi de 9 h à 19 h.
          </p>
        </div>
      </section>
    </>
  );
}
