import type { Metadata } from "next";
import Link from "next/link";
import { OecLogo } from "../../(marketing)/_components/oec-logo";
import { TeamPhoto } from "../../(marketing)/_components/team-photo";
import { getPeoplePhoto } from "@/lib/people-photos";
import { LinkedinLink } from "../../(marketing)/_components/linkedin-link";
import { TEAM } from "@/lib/team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Founded in 2018 by John Lévy, Trevys is an accounting and advisory firm supporting business owners beyond compliance: mission, values, team.",
  alternates: { canonical: "/en/about", languages: { fr: "https://www.trevys.fr/le-cabinet" } },
};

const VALUES = [
  { t: "Commitment", d: "We fully commit to every engagement, with the same high standard, whatever its size." },
  { t: "Excellence", d: "We constantly pursue quality, precision and reliability in our work." },
  { t: "Innovation", d: "We evolve our methods, tools and skills for ever more effective solutions." },
  { t: "Closeness", d: "We build lasting relationships founded on listening, availability and trust." },
  { t: "Knowledge-sharing", d: "We share our knowledge to help clients better understand their challenges and decide." },
];

const HISTOIRE = [
  { annee: "2018", titre: "The firm is founded", texte: "John Lévy founds Trevys in Paris, initially focused on organisational, financial and information-systems advisory. From the start, the ambition is to support business owners beyond the numbers, giving them an operational and strategic read on their business." },
  { annee: "2020", titre: "Structuring the accounting practice", texte: "Trevys then structures its accounting activity around the chartered accountant qualification and title. A natural choice to strengthen the firm's credibility, secure its engagements and offer clients an added layer of trust. This structuring lets Trevys bring together two complementary areas of expertise today: advisory and accounting." },
  { annee: "2023", titre: "Building the ecosystem", texte: "Trevys brings together complementary companies and experts: data and predictive steering, statutory audit, employment law, software publishing. Clients get a complete answer, with a single point of contact and clear accountability." },
  { annee: "2026", titre: "Technology and e-invoicing", texte: "The firm industrialises the use of automation and artificial intelligence in its engagements, and becomes a recognised player in the e-invoicing reform — for its clients as well as the profession, where its founder acts as a reference." },
  { annee: "2027", titre: "Focus on AI and AI project management", texte: "Trevys puts artificial intelligence to work for the finance function: automated accounting production, augmented management control, more reliable closings and decision support. The firm supports finance departments through their AI projects end to end — choosing use cases, accounting data quality, organising the finance function and change management — with the project-management rigour it has practised from the start." },
];

const PILIERS = [
  { titre: "A passion for rigour", texte: "Rigour isn't a pose, it's a habit: re-reading what seems settled, checking what everyone takes for granted, refusing “good enough” even when no one would notice. A Trevys file should be open-able by anyone, at any time, without flinching." },
  { titre: "A taste for precision", texte: "A number isn't almost right: it's right, or it's useless. Precision is what turns bookkeeping into a decision-making tool — margins you can compare, cash flow you can project, a result you can explain line by line." },
  { titre: "A sense of service", texte: "Answer. Fast, clearly, and to the question asked. Behind every request is a business owner who has to decide: our job is to make that decision easier — not to hand back the complexity with extra vocabulary." },
];

const CRED = [
  { t: "Elected within the profession", d: "Elected member of the Paris Île-de-France Regional Council of the Ordre des experts-comptables." },
  { t: "E-invoicing reference", d: "On the reform and the digital transformation of firms and companies." },
  { t: "Regular speaker", d: "For professional bodies and finance departments." },
  { t: "Lecturer, Master's in Accounting & Audit", d: "Involved in training the next generation of accounting professionals." },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">About Us</span>
          <h1>Much more than an <em>accounting firm</em></h1>
          <p>
            Founded in 2018, Trevys supports business owners beyond
            compliance: in their decisions, their transformations and their
            growth. Two areas of expertise, one ambition — creating lasting
            value.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our story</span>
            <h2>Continuous growth <em>since 2018</em></h2>
            <p>Since 2018, the firm has grown step by step, around one guiding principle: putting numbers to work for decisions.</p>
          </div>
          <ol className="mkt-histoire">
            {HISTOIRE.map((h) => (
              <li key={h.annee}>
                <span className="year">{h.annee}</span>
                <div className="body"><h3>{h.titre}</h3><p>{h.texte}</p></div>
              </li>
            ))}
          </ol>
          <div className="mkt-genese-stats" style={{ maxWidth: 860, margin: "2.4rem auto 0" }}>
            <div><b>2018</b><span>Firm founded, Paris 16th</span></div>
            <div><b>2 practices</b><span>Accounting &amp; advisory, inseparable</span></div>
            <div><b>1 ecosystem</b><span>Of companies &amp; complementary experts</span></div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our way</span>
            <h2>What gets us <em>out of bed</em></h2>
            <p>Three standards, cultivated like a craft — worth more than a long sales pitch.</p>
          </div>
          <div className="mkt-loc-grid">
            {PILIERS.map((pl, i) => (
              <div key={pl.titre} className="mkt-loc-card">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{pl.titre}</h3>
                <p>{pl.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our values</span>
            <h2>The values that <em>drive us</em></h2>
          </div>
          <div className="mkt-grid5">
            {VALUES.map((v, i) => (
              <div className="mkt-loc-card" key={v.t}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="mkt-cred">
            <div className="mkt-cred-intro">
              <span className="eyebrow">Recognised expertise</span>
              <h2>Legitimacy in the service of the <em>profession</em></h2>
              <p>Our founder, <strong>John Lévy</strong>, a chartered accountant, is actively involved in the life of the profession.</p>
              <OecLogo className="mkt-oec" />
            </div>
            <div className="mkt-cred-grid">
              {CRED.map((c) => (
                <div key={c.t} className="mkt-cred-card">
                  <span className="ck" aria-hidden="true">✓</span>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead"><span className="eyebrow">A word from the founder</span></div>
          <figure className="mkt-fq">
            <blockquote>
              When I founded Trevys, I didn&apos;t want to build yet another
              accounting firm. I wanted a firm able to support business
              owners through the deep transformations of their environment.
              Expectations have changed, professions evolve, technology opens
              new possibilities. Our role is to help companies make the most
              of it, without ever losing sight of what matters: the human
              relationship, advice and trust.
            </blockquote>
            <figcaption>
              <TeamPhoto src={getPeoplePhoto("john-levy") ?? TEAM.find((m) => m.slug === "john-levy")?.photo ?? "/brand/team/john-levy.jpg"} initials="JL" alt="John Lévy" />
              <span>
                <strong>John Lévy</strong>
                <em>Founder — Chartered Accountant</em>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The service, in practice</span>
            <h2>Commitments you can <em>verify</em></h2>
          </div>
          <div className="mkt-loc-stats" style={{ maxWidth: 1000, gridTemplateColumns: "repeat(4,1fr)" }}>
            <div><b>24 h</b><span>for a first reply, on business days</span></div>
            <div><b>3 months</b><span>maximum between closing and presenting accounts</span></div>
            <div><b>1 face</b><span>a dedicated contact, the same one over time</span></div>
            <div><b>9am–7pm</b><span>reachable Monday to Friday, in person or by video call</span></div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The team</span>
            <h2>The people of <em>Trevys</em></h2>
          </div>
          <div className="mkt-team">
            {TEAM.map((m) => (
              <div className="mkt-team-card mkt-consultant" key={m.slug}>
                <TeamPhoto src={getPeoplePhoto(m.slug) ?? m.photo} initials={m.initials} alt={m.name} />
                <div className="mkt-team-body">
                  <div className="nm">{m.firstName}</div>
                  <div className="rl">{m.role}</div>
                  <div className="mkt-team-apport">{m.apport}</div>
                  <div className="mkt-team-foot">
                    <Link className="mkt-consultant-more mkt-stretch" href={`/le-cabinet/${m.slug}`}><span className="mkt-more-txt">Learn more </span>→</Link>
                    <LinkedinLink href={m.linkedin} name={m.firstName} className="mkt-li-ic" compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Let&apos;s meet.</h2>
          <p>The best way to understand Trevys is still a conversation.</p>
          <Link className="btn btn-gold" href="/en/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
