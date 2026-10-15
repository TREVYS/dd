import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "../../(marketing)/_components/faq-section";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../(marketing)/_components/seo-jsonld";
import { ApprocheArt } from "../../(marketing)/expertise-comptable/approche-art";

export const metadata: Metadata = {
  title: "Accounting Expertise",
  description:
    "Accounting, audit, management control, legal & tax: Trevys supports founders and SMEs at every stage of their company's life.",
  alternates: { canonical: "/en/accounting-expertise", languages: { fr: "https://www.trevys.fr/expertise-comptable" } },
};

const METHODE = [
  { t: "A dedicated team", d: "Every engagement is handled by a named team who knows your file and your industry." },
  { t: "A single point of contact", d: "One lasting contact person who answers you, coordinates the work and commits on behalf of the firm." },
  { t: "Continuous monitoring", d: "Tax, accounting, e-invoicing reform: our teams rely on ongoing technical monitoring." },
  { t: "A clear debrief", d: "Every engagement ends with a personal walkthrough: you understand our work and what it changes for you." },
];

const MISSIONS = [
  "Business plan & forecasts",
  "Collecting and entering source documents",
  "Periodic account reconciliation",
  "Bookkeeping review",
  "Margin analysis",
  "Year-end closing",
  "Annual financial statements",
  "Tax and VAT filings",
  "Dashboards & reporting",
];

const BENEFICES = [
  { t: "Regulatory peace of mind", d: "Your accounting and tax obligations are handled day to day, without unpleasant surprises." },
  { t: "Reliable, usable information", d: "Accurate, up-to-date figures, presentable to banks and third parties." },
  { t: "Controlled taxation", d: "Accounting and tax options studied in your context, for fair taxation." },
  { t: "Risks identified early", d: "The risks inherent to your business are spotted early — the better to manage them." },
  { t: "Support for your projects", d: "Creation, investment, growth: every project deserves a forward-looking analysis." },
  { t: "Better governance", d: "A pragmatic read of your financial position, so you can decide with confidence." },
];

const TOOLS = [
  { t: "Tiime", d: "Real-time accounting and invoicing for freelancers and small businesses." },
  { t: "Pennylane", d: "Collaborative financial management platform for founders and accountants." },
  { t: "Sage", d: "Accounting and payroll management suite, from the desktop to the enterprise." },
  { t: "Cegid", d: "Accounting and tax solutions for firms, mid-caps and large accounts." },
  { t: "SAP", d: "The reference ERP for mid-caps and large groups — finance, procurement, production." },
  { t: "Oracle", d: "ERP and financial systems for complex, international organisations." },
  { t: "Microsoft Dynamics 365", d: "Microsoft's ERP and CRM, integrated with the Office 365 ecosystem." },
  { t: "Power BI", d: "Dashboards and decision-making reports connected to your data." },
];

const POLES = [
  { n: "01", t: "Accounting", d: "Processing your financial data, managing filings and year-end documents — for a smooth, optimised close." },
  { n: "02", t: "Audit", d: "Impartial analysis, process optimisation and strategic support to secure your growth." },
  { n: "03", t: "Management control", d: "Effective predictive tools and expert support to steer your growth." },
  { n: "04", t: "Legal & Tax", d: "Our lawyers and tax specialists support your projects and secure your decisions, close to your concerns." },
];

const OFFRES = [
  { eyebrow: "Produce", t: "TREVYS Essential", d: "Your accounting and tax obligations are kept, checked and filed on time.", quote: "“I want to delegate my bookkeeping and have peace of mind.”" },
  { eyebrow: "Understand", t: "TREVYS Steering", d: "Your numbers become readable: indicators, management checkpoints, anticipated deadlines.", quote: "“I want to understand my numbers, not just know them.”" },
  { eyebrow: "Decide", t: "TREVYS Direction", d: "Budget, cash flow, arbitration: an outsourced finance function by your side.", quote: "“I want someone by my side to steer my company.”", featured: true },
];

const FAQ = [
  { q: "How much does an accountant cost for an SME?", a: "Fees depend on transaction volume, headcount and the scope of the engagement (bookkeeping, review, payroll, advisory). At Trevys, fees are fixed and set out in an engagement letter: you know in advance what's included, with no surprise invoice at year-end. For a small business, market rates typically range from €150 to €400 excl. VAT per month; an SME with payroll and reporting is above that." },
  { q: "How do I switch accountants mid-year?", a: "It's possible at any time, and simpler than most people think. We contact your previous firm (a courtesy letter required by the code of ethics), retrieve balances, history and filings, and take over the file without interruption. You don't have to wait for year-end or manage the transition yourself." },
  { q: "What's the difference between an accountant and a statutory auditor?", a: "The accountant prepares and presents your accounts, advises and supports you day to day: they work for you. The statutory auditor certifies the accounts in the interest of third parties (shareholders, banks, the State): theirs is an independent, mandatory audit above certain thresholds. The two roles cannot be held for the same company." },
  { q: "Is an accountant mandatory?", a: "No French law requires it: a business owner can keep their own books. But preparing annual accounts carries personal liability, and mistakes (VAT, non-deductible expenses, depreciation) usually cost far more than the fees would. Using a professional registered with the Ordre also strengthens your relationships with banks and tax authorities." },
  { q: "What documents do we need to send you, and how?", a: "Purchase and sales invoices, bank statements, expense reports, contracts and payroll data. Everything goes through your secure client portal: you upload, and collection and reconciliation are largely automated. No more binders dropped off at the firm at year-end." },
  { q: "How long does it take to get our financial statements?", a: "Our commitment: accounts presented within three months of closing, with a debrief meeting to draw useful decisions from them. We also produce interim statements during the year — a balance sheet discovered eight months after closing no longer helps you steer the business." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/en" }, { name: "Accounting Expertise" }]} />
      <ServiceJsonLd
        name="Accounting Expertise"
        description="Bookkeeping and review, annual financial statements, advisory and support for business owners."
        path="/en/accounting-expertise"
        serviceType="Accounting Expertise"
      />
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Accounting Expertise</span>
          <h1>By your side at every stage of your <em>company&apos;s life</em></h1>
          <p>
            Delegate your regulatory obligations, identify risks, optimise
            your accounting and tax choices — with an accountant who listens
            and supports you proactively as you grow.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/rendez-vous">Meet an accountant</Link>
            <Link className="btn btn-ghost" href="/en/contact">Request a quote</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-appr">
            <div className="mkt-appr-copy">
              <span className="eyebrow">Our approach</span>
              <h2>Solutions tailored to <em>every situation</em></h2>
              <p>
                We approach each of your challenges from a fresh, independent
                angle, as a partner: a sound view, enriched by the breadth of
                our expertise — accounting, advisory, audit, digital
                transformation. Beyond advice, our priority is to give you
                maximum security, and let you step back in a safe setting to
                weigh the consequences of the direction you give your company.
              </p>
            </div>
            <ApprocheArt />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The accounting practice</span>
            <h2>Four <em>complementary</em> areas of expertise</h2>
          </div>
          <div className="mkt-svc-grid">
            {POLES.map((p) => (
              <div className="mkt-svc" key={p.n}>
                <span className="num">{p.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h16M9 9v11" /></svg>
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">How we work</span>
            <h2>A <em>clear</em> way of working, built for quality</h2>
            <p>A simple organisation and firm commitments on method, for a high standard on every engagement.</p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {METHODE.map((m) => (
              <div className="mkt-svc" key={m.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                </div>
                <h3 style={{ fontSize: "1.12rem" }}>{m.t}</h3>
                <p>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">What we do</span>
            <h2>From day-to-day accounting to the <em>projects that matter</em></h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", justifyContent: "center", maxWidth: 860, margin: "0 auto 3rem" }}>
            {MISSIONS.map((m) => (
              <span key={m} style={{ padding: ".55rem 1.1rem", borderRadius: 100, border: "1px solid #F5D9BE", background: "#FFF7F0", fontWeight: 600, fontSize: ".92rem", color: "#5a4330" }}>
                {m}
              </span>
            ))}
          </div>

          <div className="shead">
            <span className="eyebrow">Your benefits</span>
            <h2>What you <em>gain</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {BENEFICES.map((b) => (
              <div className="mkt-svc" key={b.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3 style={{ fontSize: "1.1rem" }}>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our offers</span>
            <h2>Three levels of support, <em>the same standard</em></h2>
            <p>
              The difference between offers isn&apos;t the number of meetings:
              it&apos;s what you do with your numbers. Each formula adapts to
              the size of your company and the scope of your needs — from the
              sole trader to the multi-entity group.
            </p>
          </div>
          <div className="mkt-offers">
            {OFFRES.map((o) => (
              <div className={`mkt-offer${o.featured ? " featured" : ""}`} key={o.t}>
                <span className="eyebrow">{o.eyebrow}</span>
                <h3>{o.t}</h3>
                <p>{o.d}</p>
                <p className="quote">{o.quote}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ textAlign: "center", marginTop: "1.6rem", color: "var(--ink3)", fontSize: ".92rem" }}>
            Whatever the formula, the principle stays the same: a dedicated
            team, a single point of contact, fixed fees known in advance. We
            set the right level together, during a first conversation.
          </p>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our tools</span>
            <h2>We adapt to <em>your organisation</em></h2>
            <p>
              We don&apos;t impose our own tool: we work in yours. Tiime,
              Pennylane, Sage, Cegid, Oracle, Power BI… we master the main
              platforms on the market and connect to your existing
              information system, with no disruption for your teams. The
              goal: make your data reliable and give you back time, whatever
              your environment.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {TOOLS.map((tool) => (
              <div className="mkt-svc" key={tool.t}>
                <span className="mkt-tool-badge" aria-hidden="true">{tool.t.slice(0, 2)}</span>
                <h3 style={{ fontSize: "1.12rem" }}>{tool.t}</h3>
                <p>{tool.d}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ textAlign: "center", marginTop: "1.4rem", color: "var(--ink3)", fontSize: ".92rem" }}>
            Using another tool? We adapt to that too — just tell us which.
          </p>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Entrust us with your accounts.</h2>
          <p>A seamless handover and a clear first read of your situation.</p>
          <Link className="btn btn-gold" href="/en/contact">Request a quote</Link>
        </div>
      </section>
      <FaqSection items={FAQ} path="/en/accounting-expertise" intro={<h2>Your questions about <em>accounting expertise</em></h2>} />
    </>
  );
}
