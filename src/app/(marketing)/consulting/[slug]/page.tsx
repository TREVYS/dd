import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONSULTANTS, getConsultant } from "@/lib/consultants";
import { SilhouetteAvatar } from "../../_components/silhouette-avatar";
import { BreadcrumbJsonLd } from "../../_components/seo-jsonld";

export function generateStaticParams() {
  return CONSULTANTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getConsultant(slug);
  if (!c) return {};
  return {
    title: `${c.firstName} — ${c.role}`,
    description: c.intro,
    alternates: { canonical: `/consulting/${slug}` },
  };
}

export default async function ConsultantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getConsultant(slug);
  if (!c) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Conseil", path: "/consulting" },
          { name: c.firstName },
        ]}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/consulting">← Nos consultants</Link>
          </nav>
          <span className="eyebrow">Consultant</span>
          <h1 style={{ textTransform: "none" }}>
            <em>{c.firstName}</em>
          </h1>
          <p>{c.role}</p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: "3rem",
              alignItems: "start",
            }}
            className="mkt-consultant-view"
          >
            <div className="mkt-team-card" style={{ maxWidth: 300 }}>
              <SilhouetteAvatar seed={c.slug} label={c.firstName} />
              <div className="mkt-team-body">
                <div className="nm">{c.firstName}</div>
                <div className="rl">{c.role}</div>
                <Link className="mkt-rdv-btn" href="/rendez-vous">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Prendre rendez-vous
                </Link>
              </div>
            </div>

            <div>
              <p style={{ fontSize: "1.15rem", color: "var(--ink)", fontWeight: 600, lineHeight: 1.5, marginBottom: "1.5rem" }}>
                {c.intro}
              </p>
              {c.bio.map((p, i) => (
                <p key={i} style={{ color: "var(--ink2)", lineHeight: 1.75, marginBottom: "1.1rem" }}>{p}</p>
              ))}

              <div style={{ marginTop: "1.6rem" }}>
                <span className="eyebrow">Expertises</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem", marginTop: "1rem" }}>
                  {c.expertises.map((e) => (
                    <span key={e} style={{ padding: ".5rem 1.1rem", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "100px", fontSize: ".85rem", color: "var(--ink2)" }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "2rem", display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
                <Link className="btn btn-gold" href="/contact">Échanger sur une mission</Link>
                <Link className="btn btn-ghost" href="/consulting">Voir toute l&apos;équipe</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
