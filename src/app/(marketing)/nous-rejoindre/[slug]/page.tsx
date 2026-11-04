import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob, trackJobView } from "@/lib/jobs";
import { mdToHtml } from "@/lib/md-preview";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

const WHY = [
  { t: "Des missions qui comptent", d: "Expertise comptable et conseil, au contact direct des dirigeants." },
  { t: "La technologie en allié", d: "IA et automatisation : moins de ressaisie, plus de conseil." },
  { t: "Au cœur de la réforme", d: "Facturation électronique : nous participons à sa construction." },
  { t: "Progression rapide", d: "Équipe à taille humaine, responsabilités qui grandissent vite." },
];

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
  const conseil = /conseil|consult/i.test(j.category);

  // Compteur de vues (best effort).
  try {
    trackJobView(slug);
  } catch { /* non bloquant */ }

  return (
    <>
      <section className="mkt-jobh-sec">
        <div className="wrap">
          <div className={`mkt-jobh${conseil ? " is-conseil" : ""}`}>
            <div className="mkt-jobh-main">
              <Link className="mkt-jobh-back" href="/nous-rejoindre">← Toutes les offres</Link>
              <span className="mkt-fl-eyebrow">{j.category} · Nous recrutons</span>
              <h1>{j.title}</h1>
              <p>{j.summary}</p>
              <div className="mkt-jobh-facts">
                <span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                  {j.contract}
                </span>
                <span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  {j.location}
                </span>
                <span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></svg>
                  {j.category}
                </span>
              </div>
              <div className="mkt-jobh-cta">
                <a className="btn mkt-fl-btn" href="#postuler">Postuler maintenant →</a>
                <a className="mkt-jobh-ghost" href="#offre">Lire l&apos;offre</a>
              </div>
            </div>
            <aside className="mkt-jobh-why">
              <span className="mkt-jobh-why-k">Pourquoi Trevys ?</span>
              <ul>
                {WHY.map((w) => (
                  <li key={w.t}>
                    <b>{w.t}</b>
                    <span>{w.d}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="sec" id="offre" style={{ paddingTop: "2.5rem", scrollMarginTop: "90px" }}>
        <div className="wrap mkt-jobd">
          <article
            className="mkt-article mkt-jobd-art"
            dangerouslySetInnerHTML={{ __html: mdToHtml(j.body) }}
          />
          <aside className="mkt-jobd-side">
            <div className="mkt-jobd-card">
              <span className="mkt-jobd-k">En bref</span>
              <dl>
                <dt>Contrat</dt><dd>{j.contract}</dd>
                <dt>Lieu</dt><dd>{j.location}</dd>
                <dt>Pôle</dt><dd>{j.category}</dd>
              </dl>
              <a className="btn mkt-fl-btn mkt-jobd-btn" href="#postuler">Postuler à cette offre</a>
              <p className="mkt-jobd-note">Chaque candidature est lue par un associé — réponse rapide.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="sec" id="postuler" style={{ scrollMarginTop: "90px", paddingTop: 0 }}>
        <div className="wrap">
          <div className="mkt-jobd-apply">
            <div className="mkt-jobd-apply-head">
              <span className="mkt-fl-eyebrow">Candidature</span>
              <h2>Envie de nous <em>rejoindre</em> ?</h2>
              <p>Quelques informations et votre CV : nous revenons vers vous rapidement.</p>
            </div>
            <ApplyForm jobSlug={j.slug} jobTitle={j.title} />
          </div>
        </div>
      </section>
    </>
  );
}
