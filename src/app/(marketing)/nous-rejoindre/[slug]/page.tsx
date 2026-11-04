import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, trackJobView } from "@/lib/jobs";
import { mdToHtml } from "@/lib/md-preview";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const j = getJob(slug);
  if (!j || j.status !== "publie") return {};
  return {
    title: `${j.title} — Recrutement`,
    description: j.summary,
    alternates: { canonical: `/nous-rejoindre/${slug}` },
  };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const j = getJob(slug);
  if (!j || j.status !== "publie") notFound();

  // Compteur de vues (best effort).
  try {
    trackJobView(slug);
  } catch { /* non bloquant */ }

  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/nous-rejoindre">← Toutes les offres</Link>
          </nav>
          <span className="eyebrow">{j.category}</span>
          <h1 style={{ textTransform: "none" }}>{j.title}</h1>
          <p>{j.summary}</p>
          <div className="mkt-jobd-facts">
            <span><small>Contrat</small>{j.contract}</span>
            <span><small>Lieu</small>{j.location}</span>
            <span><small>Pôle</small>{j.category}</span>
          </div>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1rem" }}>
        <div className="wrap mkt-jobd">
          <article
            className="mkt-article mkt-jobd-art"
            dangerouslySetInnerHTML={{ __html: mdToHtml(j.body) }}
          />
          <aside className="mkt-jobd-side">
            <div className="mkt-jobd-card">
              <span className="mkt-jobd-k">En bref</span>
              <dl>
                <dt>Poste</dt><dd>{j.title}</dd>
                <dt>Contrat</dt><dd>{j.contract}</dd>
                <dt>Lieu</dt><dd>{j.location}</dd>
                <dt>Pôle</dt><dd>{j.category}</dd>
              </dl>
              <a className="btn mkt-fl-btn mkt-jobd-btn" href="#postuler">Postuler à cette offre</a>
              <p className="mkt-jobd-note">Réponse rapide — chaque candidature est lue par un associé.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="sec" id="postuler" style={{ scrollMarginTop: "100px" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="mkt-jobd-apply">
            <div className="shead">
              <span className="mkt-fl-eyebrow">Candidature</span>
              <h2>Postuler à cette <em>offre</em></h2>
              <p>Quelques informations et votre CV : nous revenons vers vous rapidement.</p>
            </div>
            <ApplyForm jobSlug={j.slug} jobTitle={j.title} />
          </div>
        </div>
      </section>
    </>
  );
}
