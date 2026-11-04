import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedJobs } from "@/lib/jobs";
import { TEAM } from "@/lib/team";
import { getPeoplePhoto } from "@/lib/people-photos";
import { TeamPhoto } from "../_components/team-photo";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description:
    "Rejoignez Trevys : offres d'emploi en expertise comptable et en conseil, au sein d'un cabinet augmenté par la technologie et l'intelligence artificielle.",
  alternates: { canonical: "/nous-rejoindre" },
};

export const dynamic = "force-dynamic";

export default function Page() {
  const jobs = listPublishedJobs();
  const jeremy = TEAM.find((m) => m.slug === "jeremy-roch");

  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Nous rejoindre</span>
          <h1>Construisez le cabinet de <em>demain</em> avec nous</h1>
          <p>
            Expertise comptable, conseil, intelligence artificielle : chez
            Trevys, votre temps est consacré à ce qui crée réellement de la
            valeur pour les entreprises — pas à la ressaisie.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <a className="btn btn-gold" href="#offres">Voir nos offres</a>
            <a className="btn btn-ghost" href="#freelances">
              Freelance : rejoindre notre réseau
            </a>
          </div>
        </div>
      </header>

      <section className="sec" id="offres" style={{ scrollMarginTop: "100px" }}>
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos offres</span>
            <h2>{jobs.length} poste{jobs.length > 1 ? "s" : ""} ouvert{jobs.length > 1 ? "s" : ""}</h2>
          </div>
          <div className="mkt-jobs">
            {jobs.map((j) => (
              <div className="mkt-job-card mkt-consultant" key={j.id}>
                <div className="mkt-job-tags">
                  <span className="mkt-job-tag hot">{j.category}</span>
                  <span className="mkt-job-tag">{j.contract}</span>
                  <span className="mkt-job-tag">{j.location}</span>
                </div>
                <h3>{j.title}</h3>
                <p>{j.summary}</p>
                <div className="mkt-team-foot">
                  <Link className="mkt-consultant-more mkt-stretch" href={`/nous-rejoindre/${j.slug}`}>
                    <span className="mkt-more-txt">Voir l&apos;offre </span>→
                  </Link>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--ink3)" }}>
                Aucune offre ouverte pour l&apos;instant — mais une candidature
                spontanée pertinente trouve toujours preneur :{" "}
                <a href="mailto:contact@trevys.fr">contact@trevys.fr</a>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Pourquoi Trevys ?</span>
            <h2>Un cabinet <em>augmenté</em>, une équipe à taille humaine</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {[
              { t: "Des missions qui comptent", d: "Expertise comptable ET conseil : chaque semaine est différente, au contact direct des dirigeants." },
              { t: "La technologie en allié", d: "IA, automatisation, outils modernes : la production répétitive recule, le conseil avance." },
              { t: "Au cœur de la réforme", d: "Facturation électronique : nous sommes dans les instances qui la construisent — vous aussi." },
              { t: "Progression rapide", d: "Petite équipe, forte exposition : vos idées sont entendues et vos responsabilités grandissent vite." },
            ].map((c) => (
              <div className="mkt-svc" key={c.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.5-6.1 3.5 1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
                </div>
                <h3 style={{ fontSize: "1.1rem" }}>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Réseau de freelances : mis en avant, contact Jeremy Roch */}
      <section className="sec" id="freelances" style={{ scrollMarginTop: "100px" }}>
        <div className="wrap">
          <div className="mkt-fl">
            <div className="mkt-fl-main">
              <span className="mkt-fl-eyebrow">Freelances &amp; indépendants</span>
              <h2>Nous faisons <em>souvent appel</em> à des renforts</h2>
              <p>
                Nos missions auprès des directions financières demandent régulièrement des
                profils experts en appui de nos équipes. Consultant indépendant, expert-comptable
                en libéral, spécialiste SI ou data : n&apos;hésitez pas à postuler, même sans
                mission ouverte aujourd&apos;hui — les besoins arrivent vite.
              </p>
              <div className="mkt-fl-chips">
                {["Expertise comptable", "SI Finance & ERP", "AMOA & recette", "Facturation électronique", "Audit & contrôle interne", "Data & IA"].map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <ol className="mkt-fl-steps">
                <li><b>1</b><span>Vous déposez votre candidature en ligne</span></li>
                <li><b>2</b><span>Jeremy Roch vous recontacte pour un échange</span></li>
                <li><b>3</b><span>Nous vous proposons les missions qui vous correspondent</span></li>
              </ol>
              <a className="btn mkt-fl-btn" href="https://app.trevys-advisory.fr/candidature" target="_blank" rel="noopener noreferrer">
                Rejoindre notre réseau de freelances →
              </a>
            </div>
            <aside className="mkt-fl-contact">
              {jeremy && (
                <>
                  <div className="mkt-fl-photo">
                    <TeamPhoto src={getPeoplePhoto(jeremy.slug) || jeremy.photo} initials={jeremy.initials} alt={jeremy.name} />
                  </div>
                  <span className="mkt-fl-contact-k">Votre interlocuteur</span>
                  <b>{jeremy.name}</b>
                  <span className="mkt-fl-contact-r">{jeremy.role}</span>
                  <p>Jeremy prend contact avec chaque freelance qui rejoint le réseau.</p>
                  <Link className="mkt-fl-contact-more" href={`/le-cabinet/${jeremy.slug}`}>Découvrir son profil</Link>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Pas d&apos;offre à votre mesure ?</h2>
          <p>Les bons profils n&apos;attendent pas la bonne annonce. Écrivez-nous.</p>
          <a className="btn btn-gold" href="mailto:contact@trevys.fr?subject=Candidature%20spontanée">
            Candidature spontanée
          </a>
        </div>
      </section>
    </>
  );
}
