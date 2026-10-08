import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "../../(marketing)/_components/faq-section";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../../(marketing)/_components/seo-jsonld";
import { SilhouetteAvatar } from "../../(marketing)/_components/silhouette-avatar";
import { TeamPhoto } from "../../(marketing)/_components/team-photo";
import { getPeoplePhoto } from "@/lib/people-photos";
import { CONSULTANTS } from "@/lib/consultants";

export const dynamic = "force-dynamic";

const ArrowRight = () => (
  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const metadata: Metadata = {
  title: "Consulting",
  description:
    "Transformation advisory, Finance information systems, ERP, project management and e-invoicing: Trevys supports SMEs, mid-caps and large groups.",
  alternates: { canonical: "/en/consulting", languages: { fr: "https://www.trevys.fr/consulting" } },
};

const SVCS = [
  { n: "01", t: "Finance information systems", d: "Scoping, overhaul and steering of finance IT systems, from business need to rollout.", href: "/consulting/expertises/si-finance" },
  { n: "02", t: "ERP projects & project management", d: "Business-side project management and oversight on your transformational ERP programmes.", href: "/consulting/expertises/erp-amoa" },
  { n: "03", t: "Digital transformation", d: "Digitalising processes and change management to bring teams on board.", href: "/consulting/expertises/transformation-digitale" },
  { n: "04", t: "E-invoicing reform", d: "End-to-end support for the reform, for CFOs and large groups.", href: "/en/e-invoicing" },
];

const TAGS = [
  "Finance information systems", "ERP projects", "Project management", "Business analysis",
  "Digital transformation", "Change management", "Process governance",
  "Organisational optimisation", "E-invoicing reform",
];

const FAQ = [
  { q: "What does a consulting firm backed by an accounting practice bring?", a: "Access to real figures, and continuity. An external consultant spends weeks understanding your business model; our teams already have it in front of them. Recommendations are therefore costed from your actual accounts, and their rollout is followed over time by the same firm — not handed over in a report and then dropped." },
  { q: "What is an outsourced CFO, and for what size of company?", a: "It's a part-time finance leadership function: a few days a month to steer performance, cash flow, financing and banking relationships. It generally makes sense from around €2M in revenue, or earlier in case of fast growth, multiple sites, or a deal in preparation (fundraising, acquisition, sale)." },
  { q: "What does an organisational audit involve?", a: "A factual diagnosis of your processes: where time is lost, where errors repeat, where internal control is lacking. It combines interviews, observation of actual flows and timing measurement, and results in an action plan prioritised by effort and impact — not just a finding." },
  { q: "How long does a consulting engagement take?", a: "A targeted diagnosis takes 3 to 6 weeks. A transformation engagement (e-invoicing, steering overhaul, structuring the finance function) runs over 6 to 18 months, with regular checkpoints. We favour short interim deliverables over a final report discovered too late." },
  { q: "Are you independent from software vendors?", a: "Yes, entirely. We have no resale agreement or commission with vendors or Certified Platforms. That's the condition for credible advice: when we recommend a tool, it's because it fits your flows, not our interests." },
  { q: "How does an e-invoicing support engagement unfold?", a: "In three stages: diagnosis and mapping of your invoicing flows, choice of Certified Platform (specifications, consultation, comparison grid), then change management (target procedures, team training, testing, documentation). Allow 10 to 18 months for a mid-sized organisation — hence the value of starting now." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/en" }, { name: "Consulting" }]} />
      <ServiceJsonLd
        name="Consulting & Transformation"
        description="Transformation advisory, Finance information systems, ERP, project management and e-invoicing."
        path="/en/consulting"
        serviceType="Management Consulting"
      />
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Consulting</span>
          <h1>Supporting organisations through <em>transformation</em></h1>
          <p>
            SMEs, mid-caps and large groups face major transformations. Our
            strength: connecting business challenges, regulatory constraints
            and technology solutions.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="mkt-svc-grid">
            {SVCS.map((s) => (
              <Link className="mkt-svc" href={s.href} key={s.n}>
                <span className="num">{s.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <span className="more">Learn more <ArrowRight /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Where we work</span>
            <h2>Where we create <em>value</em></h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem", justifyContent: "center", maxWidth: 860, margin: "0 auto" }}>
            {TAGS.map((t) => (
              <span key={t} style={{ padding: ".55rem 1.15rem", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "100px", fontSize: ".85rem", color: "var(--ink2)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead mkt-team-head">
            <span className="eyebrow">Our team</span>
            <h2>A <em>team</em> of consultants by your side</h2>
            <p className="mkt-team-lead">
              Behind every engagement, experts with complementary backgrounds
              — finance, information systems, management control, HR,
              cybersecurity and change management. A multidisciplinary team,
              ready to mobilise close to your challenges.
            </p>
          </div>
          <div className="mkt-team">
            {CONSULTANTS.map((c) => (
              <div className="mkt-team-card mkt-consultant" key={c.slug}>
                {getPeoplePhoto(c.slug) ? (
                  <TeamPhoto src={getPeoplePhoto(c.slug)!} initials={c.initials} alt={c.firstName} />
                ) : (
                  <SilhouetteAvatar seed={c.slug} label={c.firstName} />
                )}
                <div className="mkt-team-body">
                  <div className="nm">{c.firstName}</div>
                  <div className="rl">{c.role}</div>
                  <div className="mkt-team-foot">
                    <Link className="mkt-consultant-more mkt-stretch" href={`/consulting/${c.slug}`}>
                      <span className="mkt-more-txt">Learn more </span>→
                    </Link>
                    <Link className="mkt-rdv-ic" href="/rendez-vous" aria-label={`Book a meeting — ${c.firstName}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      <span>Book</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>A transformation project?</h2>
          <p>Let&apos;s talk about your business, regulatory and technology challenges.</p>
          <Link className="btn btn-gold" href="/en/contact">Talk to a consultant</Link>
        </div>
      </section>
      <FaqSection items={FAQ} path="/en/consulting" intro={<h2>Your questions about <em>our consulting practice</em></h2>} />
    </>
  );
}
