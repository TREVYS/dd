import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConsultingExpertise } from "@/lib/consulting-expertises";
import { getCaseStudy } from "@/lib/case-studies";
import { BreadcrumbJsonLd } from "../../../../_components/seo-jsonld";

export function generateStaticParams() {
  return ["si-finance", "erp-amoa", "transformation-digitale"].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return {
    title: `${cs.h1} — Retour d'expérience`,
    description: cs.chapeau,
    // Pages volontairement non indexées et non mises en avant dans le menu :
    // accessibles uniquement depuis un bouton sur la page d'expertise.
    robots: { index: false, follow: true },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = getConsultingExpertise(slug);
  const cs = getCaseStudy(slug);
  if (!e || !cs) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Conseil", path: "/consulting" },
          { name: e.t, path: `/consulting/expertises/${slug}` },
          { name: "Retour d'expérience" },
        ]}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href={`/consulting/expertises/${slug}`}>← {e.t}</Link>
          </nav>
          <span className="eyebrow">{cs.eyebrow}</span>
          <h1>{cs.h1}</h1>
          <p>{cs.chapeau}</p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          {cs.missions.map((m, mi) => (
            <div key={m.client} style={{ marginBottom: mi < cs.missions.length - 1 ? "3rem" : 0 }}>
              <div className="shead" style={{ textAlign: "left", margin: "0 0 1.1rem" }}>
                <h2 style={{ fontSize: "1.4rem" }}>
                  {m.client}
                  {m.context && <span style={{ color: "var(--ink3)", fontWeight: 500, fontSize: "1rem" }}> — {m.context}</span>}
                </h2>
              </div>
              {m.text.map((p, i) => (
                <p key={i} style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem", marginBottom: i < m.text.length - 1 ? "1.1rem" : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un projet {e.t.toLowerCase()} en tête ?</h2>
          <p>Parlons-en : un premier échange suffit pour cerner vos enjeux.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
