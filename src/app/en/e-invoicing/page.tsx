import type { Metadata } from "next";
import Link from "next/link";
import { TeamPhoto } from "../../(marketing)/_components/team-photo";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../(marketing)/_components/seo-jsonld";
import { RfeMascot } from "../../(marketing)/facturation-electronique/rfe-mascot";
import { RfeFlowEn } from "./rfe-visuals-en";
import { getPeoplePhoto } from "@/lib/people-photos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-invoicing (French reform)",
  description:
    "Everything about the French e-invoicing reform (2026-2027): e-invoicing, e-reporting, timeline, certified platforms, Factur-X. Trevys, the independent conductor of your compliance project.",
  alternates: { canonical: "/en/e-invoicing", languages: { fr: "https://www.trevys.fr/facturation-electronique" } },
};

const METHOD = [
  { n: "01", t: "Scoping — baseline assessment", dur: "2 to 3 weeks", d: "Scope, objectives, governance and risks. Full mapping of your flows (O2C, P2P, closing), identification of friction points, RACI matrix and risk register." },
  { n: "02", t: "Design", dur: "4 to 6 weeks", d: "Translating needs into specifications, designing the target architecture, choosing the Certified Platform (PDP) and integration schemes with your existing systems." },
  { n: "03", t: "Build & integration", dur: "6 to 8 weeks", d: "Configuring connectors (ERP ↔ PDP), data transformation (Factur-X, UBL, CII), unit and end-to-end testing, user acceptance and documentation." },
  { n: "04", t: "Rollout", dur: "3 to 4 weeks", d: "Go-live, team training (CFOs, accountants, sales admin, IT), hypercare support and monitoring of the first flows and rejections." },
  { n: "05", t: "Steering & ongoing compliance", dur: "ongoing", d: "Dashboard (rejections, delays, statuses), regulatory watch, configuration adjustments and continuous improvement. “Compliance isn't a state, it's a discipline.”" },
];

const CAL = [
  { d: "Sept 1, 2026", t: "Mandatory to receive, for all companies", s: "+ mandatory to issue, for large companies and mid-caps", on: true },
  { d: "Sept 1, 2027", t: "Mandatory to issue, for SMEs, small businesses and micro-entities", s: "All VAT-registered companies are then covered", on: false },
];

const ADVANCE = [
  { d: "March 2025", t: "Business directory in production", s: "The national registry of companies and their platforms opens.", done: true },
  { d: "Feb 2026", t: "Pilot in production", s: "Companies and platforms test real data flow exchanges.", done: true },
  { d: "March 2026", t: "Public sector opens up", s: "Chorus Pro, the reference platform for the public sector.", done: true },
  { d: "June 30 – July 1, 2026", t: "Update of the 3 AFNOR standards", s: "New use cases: bidirectional self-billing, sector-specific chapters.", done: true },
  { d: "July 10, 2026", t: "The minister confirms the timeline", s: "David Amiel reaffirms the reform stays on track and announces a lenient “start-up doctrine.”", done: true, hot: true },
  { d: "Summer 2026", t: "Decree and order published", s: "Finalised texts and publication of the start-up doctrine.", done: false },
  { d: "Sept 1, 2026", t: "Entry into force", s: "Receiving mandatory for all; issuing mandatory for large companies and mid-caps.", done: false, milestone: true },
];

const FLUX = [
  { t: "E-invoicing", d: "Sending an invoice in structured format to a VAT-registered B2B customer, through a Certified Platform." },
  { t: "Lifecycle", d: "Tracking and reporting an invoice's status at every stage, from issuance through to payment." },
  { t: "E-reporting", d: "Sending transaction data not covered by e-invoicing to the tax authorities: B2C sales, exports, certain receipts." },
  { t: "Directory", d: "Looking up the national business registry and routing codes, to route the invoice to the right recipient." },
];

const FORMATS = [
  { t: "Factur-X", d: "The hybrid format: a human-readable PDF containing structured data. Best suited to small and mid-sized businesses, set to become the norm." },
  { t: "UBL", d: "A fully structured (XML) format, machine-readable. Mostly used for high volumes and automated systems." },
  { t: "CII", d: "Another structured XML format compliant with the European standard EN 16931, used in automated exchanges." },
];

const TAILLE = [
  { t: "Large companies", d: "Structured ERPs and IT systems: an asset, but also the challenge of adapting flows, managing many tools, interoperability and large-scale change management." },
  { t: "Mid-caps", d: "An exposed middle ground: heterogeneous systems, effort often underestimated. Well anticipated, the reform becomes a lever to make data reliable and gain competitiveness." },
  { t: "SMEs / small businesses", d: "The biggest leap (still a lot of paper and PDFs), but the strongest opportunity: less re-keying, shorter payment delays, full traceability." },
];

const FAQ = [
  { q: "Electronic invoice or PDF invoice: what's the difference?", a: "A “classic” PDF invoice sent by email is a dematerialised invoice, but not an electronic invoice. An electronic invoice follows a data structure set by the tax authorities (Factur-X, UBL or CII), enabling end-to-end automated processing while keeping its legal evidential value." },
  { q: "What's the difference between e-invoicing and e-reporting?", a: "E-invoicing covers the issuing and receiving of invoices between French, VAT-registered companies (B2B). E-reporting is the transmission to the tax authorities of transaction data not covered by e-invoicing: sales to individuals (B2C) and transactions abroad. Both follow the same timeline." },
  { q: "Will there be leniency at launch?", a: "Yes. On July 10, 2026, the minister confirmed the timeline while announcing a lenient “start-up doctrine” for companies acting in good faith: no automatic penalties for those who document their difficulties and correct them, at least until the end of 2026. Note: this is not a grace period — the obligation still applies, you need to be ready and documented." },
  { q: "How long does it take to prepare?", a: "Effective preparation generally takes 10 to 18 months depending on the size and complexity of the organisation. That's why you need to start now: act rather than react. A project that's started needs to be a project that's steered." },
  { q: "Is my company affected?", a: "Yes, as soon as it is VAT-registered and established in France. All companies must be able to receive electronic invoices from September 1, 2026. The obligation to issue applies in waves, based on company size, through September 2027." },
  { q: "What is a Certified Platform (PDP)?", a: "Formerly called a Partner Dematerialisation Platform, the PDP is a private operator registered by the State. Every B2B invoice will have to go through a PDP. Choosing the right platform is a structural decision — that's where our independent support really matters." },
  { q: "What happens to the Public Invoicing Portal (PPF)?", a: "The PPF no longer transmits invoices directly (the end of the “Y-scheme”). It now acts as the business directory and data hub, relaying data to the tax authorities." },
  { q: "How do I choose a Certified Platform?", a: "The choice rests on four criteria: coverage of your actual use cases (deposit invoices, credit notes, self-billing, international transactions), interfacing with your information system and accounting software, the operator's soundness and effective registration, and finally the full cost (subscription, volume, integration). We draft the specifications and comparison grid — with no commercial agreement with any vendor." },
  { q: "What does compliance cost?", a: "It combines the Certified Platform subscription (often a few dozen to a few hundred euros per month depending on volume), any interfacing development, and internal preparation time. For an SME, most of the cost is organisational, not software: reworking processes and customer/supplier records is what demands the most effort." },
  { q: "What happens if an invoice is rejected by the platform?", a: "It is not considered issued: the payment term doesn't start, delaying collection accordingly. The most common causes are incomplete customer records (SIREN, billing address) or missing mandatory mentions. That's precisely why the quality of your customer data must be addressed before the deadline, not after the first rejection." },
  { q: "Do electronic invoices need to be archived differently?", a: "Yes. The retention obligation remains six years for tax purposes (ten years for commercial purposes), but it now applies to the structured format, with authenticity, integrity and readability requirements. Evidential-value archiving and a documented reliable audit trail become topics in their own right — the most common blind spot in the projects we audit." },
  { q: "Are our small suppliers affected too?", a: "Yes, as soon as they are VAT-registered and established in France. All of them must be able to receive electronic invoices by September 1, 2026, whatever their size. Plan your communication to suppliers ahead of time: a supplier who isn't ready means a blocked purchasing flow on your end." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/en" }, { name: "E-invoicing" }]} />
      <ServiceJsonLd
        name="E-invoicing Support"
        description="End-to-end support for the French e-invoicing reform: your independent conductor for compliance."
        path="/en/e-invoicing"
        serviceType="E-invoicing"
      />

      <header className="mkt-phead mkt-ai-head">
        <div className="mkt-phead-in mkt-ai-hero">
          <div className="mkt-ai-hero-txt">
            <span className="eyebrow">E-invoicing</span>
            <h1>Your <em>conductor</em> for the reform</h1>
            <p>
              Between platforms, formats, deadlines and tools, e-invoicing is
              a project in its own right. French first, European next, we
              coordinate every stakeholder and guide you — fully
              independently — to turn it into a genuine lever for
              transformation.
            </p>
            <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
              <a className="btn btn-gold" href="https://forms.cloud.microsoft/e/mr63uL9LsU" target="_blank" rel="noopener noreferrer">Get the Reform Guide</a>
              <Link className="btn btn-ghost" href="/rendez-vous">Get a status check</Link>
            </div>
          </div>
          <RfeMascot />
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Understanding it</span>
            <h2>What <em>is</em> e-invoicing?</h2>
            <p>
              An electronic invoice is an invoice dematerialised end to end,
              whose data follows a structure set by the tax authorities —
              enabling automated processing. Note: a simple PDF sent by email
              is not an electronic invoice.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <div className="mkt-svc">
              <h3>E-invoicing</h3>
              <p>Issuing and receiving electronic invoices between VAT-registered French companies (B2B) and with the public sector (B2G).</p>
            </div>
            <div className="mkt-svc">
              <h3>E-reporting</h3>
              <p>Transmitting transaction data not covered by e-invoicing to the tax authorities: sales to individuals (B2C) and transactions abroad.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">An opportunity, not just a constraint</span>
            <h2>Beyond compliance, <em>tomorrow&apos;s opportunities</em></h2>
            <p>The reform structures data and automates accounting production. Done well, it frees up time for what really matters: steering and advisory.</p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <div className="mkt-svc"><h3 style={{ fontSize: "1.12rem" }}>Structured data</h3><p>No more heterogeneous flows (paper, emails, PDFs): one consistent entry point, with no re-keying errors.</p></div>
            <div className="mkt-svc"><h3 style={{ fontSize: "1.12rem" }}>Automated production</h3><p>Accounting largely automated and, eventually, pre-filled VAT returns.</p></div>
            <div className="mkt-svc"><h3 style={{ fontSize: "1.12rem" }}>More time for advisory</h3><p>Value shifts towards steering, analysis and supporting the business owner.</p></div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The timeline</span>
            <h2>A <em>phased</em> entry into force</h2>
            <p>Adoption is phased from 2026 to 2027, based on company size. Effective preparation takes 10 to 18 months: <strong>anticipating means acting rather than reacting</strong>.</p>
          </div>
          <div className="mkt-timeline">
            {CAL.map((c) => (
              <div className={`mkt-tl-item${c.on ? " on" : ""}`} key={c.d}>
                <div className="mkt-tl-date">{c.d}</div>
                <div className="mkt-tl-title">{c.t}</div>
                <div className="mkt-tl-sub">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Where the reform stands</span>
            <h2>A reform that&apos;s <em>moving</em> — tracked in real time</h2>
            <p>
              A member of the <strong>DGFiP relay community</strong> and
              involved in AFNOR standardisation work, Trevys sits at the
              heart of the process: we relay the latest decisions and carry
              the voice of businesses.
            </p>
          </div>
          <div className="mkt-vtl">
            {ADVANCE.map((a) => (
              <div className={`mkt-vtl-item${a.done ? " done" : ""}${a.hot ? " hot" : ""}${a.milestone ? " milestone" : ""}`} key={a.d}>
                <div className="mkt-vtl-node" />
                <div className="mkt-vtl-body">
                  <div className="mkt-vtl-date">{a.d}{a.hot && <span className="mkt-vtl-tag">Latest update</span>}</div>
                  <div className="mkt-vtl-title">{a.t}</div>
                  <div className="mkt-vtl-sub">{a.s}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mkt-stats-row">
            <div className="mkt-stat-chip"><b>138</b><span>registered Certified Platforms</span></div>
            <div className="mkt-stat-chip"><b>2M</b><span>companies already in the directory</span></div>
            <div className="mkt-stat-chip"><b>95</b><span>Peppol contracts signed</span></div>
            <div className="mkt-stat-chip"><b>76%</b><span>of business owners confident for the deadline</span></div>
          </div>
          <p className="muted" style={{ fontSize: ".78rem", color: "var(--ink3)", marginTop: "1rem" }}>
            Sources: DGFiP / AIFE — Relay community, July 10, 2026. E-invoicing barometer (IPSOS).
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">How it works</span>
            <h2>The new invoice <em>flow</em></h2>
            <p>No more &quot;Y-scheme&quot;: every invoice now passes through a Certified Platform. The Public Invoicing Portal (PPF) becomes a directory and data hub for the tax authorities.</p>
          </div>
          <RfeFlowEn />

          <div className="shead" style={{ marginTop: "3rem" }}>
            <span className="eyebrow">The 4 flows of the ecosystem</span>
            <h2>What <em>actually</em> flows</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
            {FLUX.map((f) => (
              <div className="mkt-svc" key={f.t}><h3 style={{ fontSize: "1.1rem" }}>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>

          <div className="shead" style={{ marginTop: "3rem" }}>
            <span className="eyebrow">The formats</span>
            <h2>Three formats, <em>one emerging standard</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {FORMATS.map((f) => (
              <div className="mkt-svc" key={f.t}><h3 style={{ fontSize: "1.15rem" }}>{f.t}</h3><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-orch">
            <div className="mkt-orch-txt">
              <span className="eyebrow">Our role</span>
              <h2>A <em>conductor</em>, not a software vendor</h2>
              <p>
                Vendors, Certified Platforms, IT, accounting teams, business
                owners: a successful compliance project involves many
                stakeholders. Our role is to <strong>coordinate</strong> them
                and guarantee a well-controlled evolution.
              </p>
              <p>
                We sell no platform: we help you choose the right one,
                integrate it with your information system and bring your
                teams on board — clear governance (steering committee,
                project team), defined roles (RACI matrix) and controlled
                milestones.
              </p>
            </div>
            <ul className="mkt-orch-list">
              <li><b>Independence</b><span>No commercial ties with any vendor: our recommendations are objective.</span></li>
              <li><b>Big-picture view</b><span>Flows, tools, teams, deadlines: we hold every thread of the project.</span></li>
              <li><b>Compliance guarantor</b><span>An accounting firm, guaranteeing end-to-end tax and documentary compliance.</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our method</span>
            <h2>A <em>5-phase</em> project approach</h2>
            <p>A proven methodology, paced by clear milestones and concrete deliverables at every stage.</p>
          </div>
          <div className="mkt-svc-grid">
            {METHOD.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <span className="mkt-svc-dur">{s.dur}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Tailored support</span>
            <h2>Adapted to <em>your organisation</em></h2>
            <p>Large company, mid-cap or SME: the challenges differ, our method adjusts to your reality.</p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {TAILLE.map((t) => (
              <div className="mkt-svc" key={t.t}><h3 style={{ fontSize: "1.15rem" }}>{t.t}</h3><p>{t.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="mkt-founder">
            <div className="mkt-founder-media">
              <TeamPhoto src={getPeoplePhoto("john-levy") ?? "/uploads/john-levy.jpg"} initials="JL" alt="John Lévy, founder of Trevys" />
              <div className="mkt-founder-id">
                <div className="nm">John Lévy</div>
                <div className="rl">Founder · Chartered Accountant</div>
              </div>
            </div>
            <div className="mkt-founder-body">
              <span className="eyebrow">At the heart of the reform</span>
              <h2>A firm connected to the bodies <em>building</em> the reform</h2>
              <blockquote className="mkt-founder-quote">
                &ldquo;I actively take part in industry discussions on
                e-invoicing. This involvement gives me access to the latest
                information — and lets me carry the voice of businesses to
                the bodies shaping the reform.&rdquo;
              </blockquote>
              <ul className="mkt-founder-cred">
                <li><span className="k">AFNOR</span> Member, involved in standardisation work</li>
                <li><span className="k">Relay community</span> Involved since launch</li>
                <li><span className="k">Ordre des experts-comptables</span> Elected to the Paris Île-de-France Regional Council</li>
                <li><span className="k">Reform training</span> Designer of a training programme on e-invoicing project management</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Frequently asked questions</span>
            <h2>Everything you need in <em>a few answers</em></h2>
          </div>
          <div className="mkt-faq">
            {FAQ.map((f) => (
              <details className="mkt-faq-item" key={f.q}>
                <summary>{f.q}<span className="mkt-faq-plus" aria-hidden="true" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Where do you stand on the reform?</h2>
          <p>Let&apos;s review your level of readiness and build your roadmap.</p>
          <div style={{ display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-gold" href="https://forms.cloud.microsoft/e/mr63uL9LsU" target="_blank" rel="noopener noreferrer">Get the Reform Guide</a>
            <Link className="btn btn-ghost" href="/rendez-vous">Book a meeting</Link>
          </div>
        </div>
      </section>
    </>
  );
}
