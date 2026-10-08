import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accounting, Advisory & AI Expertise — Paris",
  description:
    "Trevys Advisory is a Paris-based accounting and advisory firm, supporting French and international companies on accounting, audit, consulting and AI integration.",
  alternates: { canonical: "/en" },
};

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
            <a className="btn btn-ghost" href="mailto:contact@trevys-advisory.fr">Email us</a>
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

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Get in touch</span>
            <h2>Let&apos;s talk about your project.</h2>
            <p>
              One conversation is usually enough to see where Trevys can
              help. Write to us at{" "}
              <a href="mailto:contact@trevys-advisory.fr" style={{ color: "var(--violet)", fontWeight: 700 }}>contact@trevys-advisory.fr</a>,
              call <a href="tel:+33768050465" style={{ color: "var(--violet)", fontWeight: 700 }}>+33 7 68 05 04 65</a>, or book a meeting directly below.
            </p>
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Book a meeting.</h2>
          <p>Tell us about your company — we&apos;ll get back to you quickly.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Book a meeting</Link>
        </div>
      </section>
    </>
  );
}
