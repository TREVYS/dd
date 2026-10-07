import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accounting, Advisory & AI Expertise — Paris",
  description:
    "Trevys Advisory is a Paris-based accounting and advisory firm, supporting French and international companies on accounting, audit, consulting and AI integration.",
  alternates: { canonical: "/en" },
};

// Page d'accueil anglaise minimale : le reste du site bilingue se construit
// pas à pas (voir le chantier de traduction). Objectif ici : donner aux
// visiteurs étrangers de quoi comprendre l'activité et nous contacter.
export default function EnHome() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Trevys Advisory</span>
          <h1>Expertise, <em>at the speed of technology.</em></h1>
          <p>
            Trevys Advisory is an accounting and advisory firm based in Paris
            16ᵉ. We support founders, CFOs and international groups on
            accounting, audit, management control, legal &amp; tax, digital
            transformation, and the integration of AI into finance functions.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Book a meeting</Link>
            <Link className="btn btn-ghost" href="/contact">Contact us</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">What we do</span>
            <h2>Two areas of <em>expertise</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            <div className="mkt-svc">
              <h3>Accounting &amp; audit</h3>
              <p>Bookkeeping, financial statements, audit, management control, legal &amp; tax — with a dedicated team and a single point of contact.</p>
            </div>
            <div className="mkt-svc">
              <h3>Advisory &amp; AI</h3>
              <p>Finance information systems, ERP projects, e-invoicing compliance, organisational audit, and AI integration for finance teams.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Let&apos;s talk about your project.</h2>
          <p>One conversation is usually enough to see where Trevys can help.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Book a meeting</Link>
        </div>
      </section>
    </>
  );
}
