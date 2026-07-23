import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SECTORS, getSector } from "@/lib/sectors";
import { SectorArt } from "../../_components/sector-art";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../_components/seo-jsonld";

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getSector(slug);
  if (!s) return {};
  return {
    title: `${s.title} — Secteur`,
    description: s.tagline,
    alternates: { canonical: `/secteurs/${slug}` },
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getSector(slug);
  if (!s) notFound();

  const others = SECTORS.filter((x) => x.slug !== s.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Références", path: "/references" },
          { name: s.title },
        ]}
      />
      <ServiceJsonLd
        name={`Expertise ${s.title}`}
        description={s.tagline}
        path={`/secteurs/${s.slug}`}
        serviceType={`Expertise comptable et conseil — ${s.title}`}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/references">← Références &amp; secteurs</Link>
          </nav>
          <span className="eyebrow">Secteur</span>
          <h1><em>{s.title}</em></h1>
          <p>{s.intro}</p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Échanger avec un expert</Link>
            <Link className="btn btn-ghost" href="/contact">Demander un devis</Link>
          </div>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1.6rem" }}>
        <div className="wrap">
          <div className="mkt-sector-hero">
            <SectorArt art={s.art} title={s.title} banner />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Vos enjeux</span>
            <h2>Ce qui se joue dans <em>votre secteur</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {s.enjeux.map((e) => (
              <div className="mkt-svc" key={e.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2l9 5v10l-9 5-9-5V7z" /></svg>
                </div>
                <h3 style={{ fontSize: "1.1rem" }}>{e.t}</h3>
                <p>{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos interventions</span>
            <h2>Ce que nous <em>faisons</em> pour vous</h2>
          </div>
          <ul className="mkt-sector-missions">
            {s.missions.map((m) => (
              <li key={m}>
                <span className="ck" aria-hidden="true">✓</span>
                {m}
              </li>
            ))}
          </ul>

          {s.clients && s.clients.length > 0 && (
            <p className="mkt-sector-refs">
              <strong>Ils nous font confiance dans ce secteur :</strong>{" "}
              {s.clients.join(" · ")}
            </p>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Autres secteurs</span>
            <h2>Nous intervenons <em>aussi</em></h2>
          </div>
          <div className="mkt-sector-others">
            {others.map((o) => (
              <Link key={o.slug} href={`/secteurs/${o.slug}`} className="mkt-sector-chip">
                {o.title} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Parlons de votre activité.</h2>
          <p>Un premier échange suffit pour cerner vos enjeux — et ce que Trevys peut y changer.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
