import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../(marketing)/_components/seo-jsonld";
import { AiRobot } from "../../(marketing)/_components/ai-robot";

export const metadata: Metadata = {
  title: "Artificial Intelligence",
  description:
    "From digital transformation advisory to AI expertise: Trevys supports the integration of AI solutions with a 360° view (IT security, architecture, RAG, data storage), under permanent human control.",
  alternates: { canonical: "/en/ai", languages: { fr: "https://www.trevys.fr/intelligence-artificielle" } },
};

const CARDS = [
  { t: "Value first", d: "No technology for technology's sake: we integrate it only when it serves the client." },
  { t: "Human control", d: "The expert validates and arbitrates. AI proposes, the professional decides." },
  { t: "Transparency", d: "Explainable, documented usage, in the service of quality and peace of mind." },
];

const SCOPE = [
  { t: "IT security & compliance", d: "Protecting sensitive data, access management, GDPR, sovereignty: AI must never open a breach.", icon: "M12 2l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V5l8-3z" },
  { t: "Architecture & integration", d: "We connect AI building blocks to your existing IT system (ERP, business apps, tools) cleanly, without technical debt.", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { t: "RAG & knowledge bases", d: "Augmented search over your own documents: reliable, sourced, up-to-date answers — not hallucinations.", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2zM14 3v5h5" },
  { t: "Storage & data", d: "Structuring, quality and governance of data — the true fuel of a high-performing, well-governed AI.", icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" },
  { t: "Solution selection & integration", d: "Choosing the right tools (vendors, models, open-source components) and integrating them close to your actual usage.", icon: "M12 2a3 3 0 013 3 4 4 0 014 4 3 3 0 010 6 4 4 0 01-4 4 3 3 0 01-6 0 4 4 0 01-4-4 3 3 0 010-6 4 4 0 014-4 3 3 0 013-3z" },
  { t: "Governance & change management", d: "Usage framework, team training, adoption: a useful AI is an AI that's actually used.", icon: "M16 11a4 4 0 10-8 0M2 21a8 8 0 0120 0M12 3v0" },
];

const USECASES = [
  { t: "CRM for law firms", d: "Design and rollout of a business CRM tailored to law firms." },
  { t: "CRM for accounting firms", d: "A bespoke CRM for client relationships and steering of an accounting practice." },
  { t: "Skills matching (IT services)", d: "A skills-matching tool to optimise staffing for an IT services company." },
  { t: "Skills analysis & internal mobility", d: "A skills analysis tool supporting internal mobility within a large banking group." },
];

const CASES = [
  {
    t: "Licornne",
    role: "Specifications & editor support",
    d: "Licornne is a hub dedicated to accounting firms: it centralises the tools, resources and client portal a firm needs day to day. Trevys worked upstream with the publisher, translating concrete business needs into actionable specifications, then supported the platform's design to keep it true to the real-world practice of an accounting firm.",
    url: "https://www.licornne.com/",
  },
  {
    t: "BankAI",
    role: "Specifications & editor support — HR track",
    d: "BankAI is an AI tool dedicated to HR for banking institutions: it supports HR teams in their processes (recruitment, mobility, skills management). Trevys brought its business expertise to the publisher on this HR track, from writing the specifications to supporting the design, to ensure a solution grounded in the realities of the banking sector.",
    url: "https://bankai.sonam-ai.com/",
  },
  {
    t: "Alfred",
    role: "In-house design & development",
    d: "Alfred is the marketing & communications AI agent Trevys designed and built in-house, for its own needs. It runs the firm's website, article writing, social media posts and newsletters day to day — a concrete illustration of our AI expertise, applied first to ourselves.",
    url: undefined,
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/en" }, { name: "Artificial Intelligence" }]} />
      <ServiceJsonLd
        name="Artificial Intelligence Solutions"
        description="Advisory, integration and deployment of AI solutions, with a 360° view (security, architecture, RAG, data)."
        path="/en/ai"
        serviceType="Artificial Intelligence"
      />

      <header className="mkt-phead mkt-ai-head">
        <div className="mkt-phead-in mkt-ai-hero">
          <div className="mkt-ai-hero-txt">
            <span className="eyebrow">Artificial Intelligence</span>
            <h1>AI, the <em>natural</em> extension of our advisory work</h1>
            <p>
              As digital transformation consultants, we took the AI turn at
              the heart of our engagements — turning it into a dedicated area
              of expertise. We support the integration of AI solutions, with
              a 360° view on everything that conditions their success.
            </p>
            <div className="mkt-ai-hero-cta">
              <Link className="btn btn-gold" href="/rendez-vous">Talk about your AI project</Link>
              <Link className="btn btn-ghost" href="/en/consulting">See our consulting offer</Link>
            </div>
          </div>
          <AiRobot />
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our journey</span>
            <h2>From transformation advisory to <em>AI expertise</em></h2>
          </div>
          <div className="mkt-svc-grid">
            <div className="mkt-svc">
              <span className="num">01</span>
              <h3>A consulting practice</h3>
              <p>Our core business is digital transformation advisory: finance IT systems, ERP, automation, change management. Supporting organisations through change is our daily work.</p>
            </div>
            <div className="mkt-svc">
              <span className="num">02</span>
              <h3>The AI turn</h3>
              <p>So AI naturally found its way into our engagements. We explored it, tested it on real cases, then structured it into genuine expertise — not a passing trend.</p>
            </div>
            <div className="mkt-svc">
              <span className="num">03</span>
              <h3>An integrator role</h3>
              <p>We support the integration of AI solutions into your environment, bridging the gap between business needs, tools and your information system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">A 360° view</span>
            <h2>We cover <em>every angle</em> of an AI project</h2>
            <p>
              A successful AI project is never just a model. It involves
              security, architecture, data and usage. We take a complete
              view so every building block fits together without risk or
              blind spots.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {SCOPE.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico"><svg viewBox="0 0 24 24"><path d={s.icon} /></svg></div>
                <h3 style={{ fontSize: "1.15rem" }}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">A framework of trust</span>
            <h2>AI that is <em>controlled</em> and responsible</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {CARDS.map((c) => (
              <div className="mkt-svc" key={c.t}>
                <h3 style={{ fontSize: "1.2rem" }}>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our work</span>
            <h2>Solutions <em>designed, built and deployed</em></h2>
            <p>We actively take part in designing, building and deploying software and AI solutions for our clients.</p>
          </div>

          <div style={{ background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)", border: "1px solid #F5D9BE", borderLeft: "4px solid #F5811F", borderRadius: "16px", padding: "1.75rem 2rem", maxWidth: "860px", margin: "0 auto 2.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 .75rem" }}>Why Trevys takes on these topics</h3>
            <p style={{ margin: 0 }}>
              Because it&apos;s in our DNA. Our <strong>digital transformation</strong>{" "}
              teams naturally gravitate to these questions: we follow current
              topics closely and seek, as we did for the{" "}
              <strong>e-invoicing reform</strong>, to be among the{" "}
              <strong>pioneering</strong> firms rather than suffer the change.
              And because we also wear the{" "}
              <strong>accountant&apos;s hat</strong>, we know how decisive{" "}
              <strong>rigour</strong> is: who, better than us, knows your
              numbers, your processes and the organisation of your company?
              This intimate knowledge of your business lets us translate a
              business need into a solution that is{" "}
              <strong>right: useful, reliable and genuinely adopted</strong>{" "}
              by your teams. Where others deliver a technology,{" "}
              <strong>we step into the heart of the project as the business
              lead</strong> and design a response grounded in the reality of
              your company — because we understand it from the inside.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {USECASES.map((u) => (
              <div className="mkt-svc" key={u.t}>
                <div className="ico"><svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 013 3 4 4 0 014 4 3 3 0 010 6 4 4 0 01-4 4 3 3 0 01-6 0 4 4 0 01-4-4 3 3 0 010-6 4 4 0 014-4 3 3 0 013-3z" /></svg></div>
                <h3 style={{ fontSize: "1.15rem" }}>{u.t}</h3>
                <p>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Real cases</span>
            <h2>Projects <em>we can name</em></h2>
            <p>Beyond confidential engagements, here are projects where our role as business lead is public.</p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {CASES.map((c) => (
              <div className="mkt-svc" key={c.t}>
                <span className="eyebrow" style={{ marginBottom: ".4rem", display: "block" }}>{c.role}</span>
                <h3 style={{ fontSize: "1.2rem" }}>{c.t}</h3>
                <p>{c.d}</p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: ".6rem", fontWeight: 700, color: "var(--violet)" }}>
                    Discover {c.t} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Have a use case in mind?</h2>
          <p>Let&apos;s see together whether — and how — AI can create real value for your organisation.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Book a meeting</Link>
        </div>
      </section>
    </>
  );
}
