import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEAM, getLeader } from "@/lib/team";
import { TeamPhoto } from "../../_components/team-photo";
import { getPeoplePhoto } from "@/lib/people-photos";
import { LinkedinLink } from "../../_components/linkedin-link";
import { BreadcrumbJsonLd } from "../../_components/seo-jsonld";

export function generateStaticParams() {
  return TEAM.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getLeader(slug);
  if (!m) return {};
  return {
    title: `${m.firstName} — ${m.role}`,
    description: m.intro,
    alternates: { canonical: `/le-cabinet/${slug}` },
  };
}

export default async function LeaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getLeader(slug);
  if (!m) notFound();

  // Fiche Person pour Google (apparition dans les résultats liés au cabinet).
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    description: m.intro,
    worksFor: { "@id": "https://www.trevys.fr/#organization" },
    url: `https://www.trevys.fr/le-cabinet/${m.slug}`,
    sameAs: m.linkedin ? [m.linkedin] : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Le cabinet", path: "/le-cabinet" },
          { name: m.firstName },
        ]}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/le-cabinet">← Le cabinet</Link>
          </nav>
          <span className="eyebrow">{m.apport}</span>
          <h1 style={{ textTransform: "none" }}>
            <em>{m.firstName}</em>
          </h1>
          <p>{m.role}</p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div className="mkt-consultant-view" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "3rem", alignItems: "start" }}>
            <div>
              <div className="mkt-team-card" style={{ maxWidth: 300 }}>
                <TeamPhoto src={getPeoplePhoto(m.slug) ?? m.photo} initials={m.initials} alt={m.name} />
                <div className="mkt-team-body">
                  <div className="nm">{m.firstName}</div>
                  <div className="rl">{m.role}</div>
                  <LinkedinLink href={m.linkedin} name={m.firstName} className="mkt-li-btn" />
                </div>
              </div>
            </div>

            <div>
              <div className="mkt-apport">
                <span className="eyebrow">Son apport dans le groupe</span>
                <strong>{m.apport}</strong>
              </div>

              <p style={{ fontSize: "1.15rem", color: "var(--ink)", fontWeight: 600, lineHeight: 1.5, margin: "1.4rem 0 1.5rem" }}>
                {m.intro}
              </p>
              {m.resume.map((p, i) => (
                <p key={i} style={{ color: "var(--ink2)", lineHeight: 1.75, marginBottom: "1.1rem" }}>{p}</p>
              ))}

              <div style={{ marginTop: "1.8rem" }}>
                <span className="eyebrow">Grands chantiers menés</span>
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".7rem", marginTop: "1rem" }}>
                  {m.chantiers.map((c) => (
                    <li key={c} style={{ display: "flex", gap: ".8rem", color: "var(--ink2)", lineHeight: 1.6 }}>
                      <span style={{ color: "var(--violet)", fontWeight: 800 }}>—</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: "2rem", display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
                <Link className="btn btn-gold" href="/contact">Échanger avec l&apos;équipe</Link>
                <Link className="btn btn-ghost" href="/le-cabinet">Retour au cabinet</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
