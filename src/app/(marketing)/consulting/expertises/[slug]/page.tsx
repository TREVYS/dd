import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONSULTING_EXPERTISES, getConsultingExpertise } from "@/lib/consulting-expertises";
import { BreadcrumbJsonLd } from "../../../_components/seo-jsonld";

export function generateStaticParams() {
  return CONSULTING_EXPERTISES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = getConsultingExpertise(slug);
  if (!e) return {};
  return {
    title: e.t,
    description: e.chapeau,
    alternates: { canonical: `/consulting/expertises/${slug}` },
  };
}

export default async function ExpertisePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getConsultingExpertise(slug);
  if (!e) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Conseil", path: "/consulting" },
          { name: e.t },
        ]}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/consulting">← Consulting</Link>
          </nav>
          <span className="eyebrow">Consulting</span>
          <h1>{e.t}</h1>
          <p>{e.chapeau}</p>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
            <Link className="btn btn-ghost" href="/contact">Échanger sur un projet</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          {e.intro.map((p, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? "1.1rem" : "1.02rem",
                fontWeight: i === 0 ? 500 : 400,
                color: i === 0 ? "var(--ink)" : "var(--ink2)",
                lineHeight: 1.8,
                marginBottom: i < e.intro.length - 1 ? "1.2rem" : 0,
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="sec band">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="shead" style={{ textAlign: "left", margin: "0 0 1.4rem" }}>
            <span className="eyebrow">Une équipe pluridisciplinaire</span>
            <h2>Des experts <em>hybrides</em>, depuis toujours</h2>
          </div>
          {e.equipe.map((p, i) => (
            <p key={i} style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem", marginBottom: i < e.equipe.length - 1 ? "1.1rem" : 0 }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="shead" style={{ textAlign: "left", margin: "0 0 1.2rem" }}>
            <span className="eyebrow">Notre agilité au quotidien</span>
            <h2>{e.agilite.titre}</h2>
          </div>
          <p style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem" }}>{e.agilite.texte}</p>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre méthodologie</span>
            <h2>Une approche <em>éprouvée</em>, étape par étape</h2>
          </div>
          <ol className="mkt-steps">
            {e.methode.map((m, i) => (
              <li key={m.titre}>
                <span className="dot">{i + 1}</span>
                <h3>{m.titre}</h3>
                <p>{m.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un projet {e.t.toLowerCase()} ?</h2>
          <p>Parlons de vos enjeux : nous vous aidons à cadrer le bon périmètre et la bonne méthode.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">Pour aller plus loin</span>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", justifyContent: "center", marginTop: "1.1rem" }}>
            {CONSULTING_EXPERTISES.filter((x) => x.slug !== e.slug).map((x) => (
              <Link key={x.slug} className="btn btn-ghost btn-sm" href={`/consulting/expertises/${x.slug}`}>
                {x.t}
              </Link>
            ))}
            <Link className="btn btn-ghost btn-sm" href="/facturation-electronique">Facturation électronique</Link>
          </div>
        </div>
      </section>
    </>
  );
}
