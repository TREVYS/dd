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
          <div className="mkt-job-tags" style={{ justifyContent: "center", marginBottom: "1rem" }}>
            <span className="mkt-job-tag hot">{j.category}</span>
            <span className="mkt-job-tag">{j.contract}</span>
            <span className="mkt-job-tag">{j.location}</span>
          </div>
          <h1 style={{ textTransform: "none" }}>{j.title}</h1>
          <p>{j.summary}</p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.6rem" }}>
            <a className="btn btn-gold" href="#postuler">Postuler</a>
          </div>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: "1.5rem" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <article
            className="mkt-article"
            dangerouslySetInnerHTML={{ __html: mdToHtml(j.body) }}
          />
        </div>
      </section>

      <section className="sec band" id="postuler">
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="shead">
            <span className="eyebrow">Candidature</span>
            <h2>Postuler à cette <em>offre</em></h2>
            <p>Réponse rapide garantie — chaque candidature est lue par un associé.</p>
          </div>
          <ApplyForm jobSlug={j.slug} jobTitle={j.title} />
        </div>
      </section>
    </>
  );
}
