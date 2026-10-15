import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../(marketing)/_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Organizational Audit",
  description:
    "Organizational audit: processes, internal control, governance, and audit of the Reliable Audit Trail (PAF) — a key, often overlooked topic of the e-invoicing reform. Independent diagnosis to make your organisation more reliable and secure your compliance.",
  alternates: { canonical: "/en/organizational-audit", languages: { fr: "https://www.trevys.fr/audit-organisationnel" } },
};

const DOMAINS = [
  { n: "01", t: "Processes & operational efficiency", d: "Process mapping, identification of friction points, re-keying and low-value tasks." },
  { n: "02", t: "Internal control", d: "Segregation of duties, control points, reliable audit trail and management of error or fraud risk." },
  { n: "03", t: "Finance function organisation", d: "Roles, responsibilities and team sizing; closing quality and timeliness, reporting and steering." },
  { n: "04", t: "Governance & accountability", d: "Clarity of decision-making bodies, approval workflows and delegations." },
  { n: "05", t: "Risk management", d: "Mapping of operational, financial and compliance risks, and associated control measures." },
  { n: "06", t: "Performance & cost optimisation", d: "Steering indicators, efficiency levers and automation opportunities." },
];

const PAF = [
  { t: "Process documentation", d: "Formalising the purchase (P2P) and sales (O2C) cycles and their associated controls — the basis of a reliable audit trail." },
  { t: "End-to-end traceability", d: "The continuous, verifiable link between order, delivery/execution, invoice and payment." },
  { t: "Control points & segregation of duties", d: "The key controls that ensure no invoice strays from the reality of the transaction." },
  { t: "Authenticity, integrity, readability", d: "The three legal requirements for every invoice, from issuance to archiving." },
  { t: "Evidential-value archiving", d: "Secure, legally enforceable retention of invoices and supporting documents." },
  { t: "Tax audit readiness", d: "A documented, presentable audit trail, to face a tax audit with confidence." },
];

const APPROACH = [
  { t: "Diagnosis", d: "Interviews, document analysis and on-the-ground observation to understand what's there, with no preconceptions." },
  { t: "Analysis & benchmark", d: "Comparing against best practice and identifying gaps and room for improvement." },
  { t: "Transformation plan", d: "Prioritised recommendations and a realistic, results-oriented roadmap." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/en" }, { name: "Organizational Audit" }]} />
      <ServiceJsonLd
        name="Organizational Audit"
        description="Independent organisational audit: processes, internal control, governance, finance function and operational efficiency."
        path="/en/organizational-audit"
        serviceType="Organizational Audit"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Organizational Audit</span>
          <h1>Revealing your organisation&apos;s <em>hidden performance</em></h1>
          <p>
            Processes that jam, blurred controls, poorly defined roles: the
            organisation is often the first untapped source of performance.
            Our organizational audit provides an independent diagnosis and a
            concrete roadmap — with a particular focus on the finance
            function.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Discuss an audit</Link>
            <Link className="btn btn-ghost" href="/en/consulting">See our consulting offer</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our areas</span>
            <h2>What we <em>examine</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {DOMAINS.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <div className="ico"><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg></div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The topic many forget</span>
            <h2>Auditing the <em>Reliable Audit Trail</em> (PAF)</h2>
            <p>
              The Reliable Audit Trail is a legal requirement (art. 289 VII of
              the French tax code): a documented set of controls that
              establishes, for every invoice, the link to the reality of the
              transaction — and guarantees the authenticity of origin,
              integrity of content and readability, from issuance to
              archiving.
            </p>
          </div>

          <div style={{ background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)", border: "1px solid #F5D9BE", borderLeft: "4px solid #F5811F", borderRadius: "16px", padding: "1.6rem 1.9rem", maxWidth: "880px", margin: "0 auto 2.5rem" }}>
            <h3 style={{ fontSize: "1.2rem", margin: "0 0 .7rem" }}>E-invoicing: an underestimated issue</h3>
            <p style={{ margin: 0 }}>
              Many assume that with electronic invoicing, the audit trail
              disappears. <strong>That&apos;s wrong.</strong> It is still
              required for every flow that isn&apos;t a structured electronic
              invoice (paper or PDF invoices, B2C sales, international
              transactions under e-reporting), and the tax authorities rely
              on it during an audit. Neglecting your audit trail means real
              tax risk — right when invoicing processes are being reshaped by
              the reform.
            </p>
          </div>

          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PAF.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg></div>
                <h3 style={{ fontSize: "1.12rem" }}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our approach</span>
            <h2>From <em>diagnosis</em> to action plan</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {APPROACH.map((c) => (
              <div className="mkt-svc" key={c.t}><h3 style={{ fontSize: "1.2rem" }}>{c.t}</h3><p>{c.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Want more clarity on your organisation?</h2>
          <p>A first conversation is enough to identify your challenges and priorities.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Book a meeting</Link>
        </div>
      </section>
    </>
  );
}
