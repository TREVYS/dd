import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Ecosystem",
  description:
    "The TREVYS Group — KLARE STUDIO, WELL&WIZ, URCA, SONAM IA — and its partners PHOENIX, DECA Paris and NewTech, serving our clients in France and internationally.",
  alternates: { canonical: "/en/ecosystem", languages: { fr: "https://www.trevys.fr/notre-ecosysteme" } },
};

const GROUP = [
  { t: "KLARE STUDIO", d: "Predictive steering solutions to anticipate trends, optimise performance and inform decisions.", u: "https://klare-studio.io/" },
  { t: "WELL&WIZ", d: "A consulting firm mobilising a community of freelance experts, from strategy to execution.", u: "https://wellandwiz.com/" },
  { t: "URCA", d: "Statutory audit: rigorous support to secure your processes and legal obligations.", u: "http://urca.io/" },
  { t: "SONAM IA", d: "An IT services firm specialising in AI consultants, to strengthen your teams on AI projects.", u: "https://wellandwiz-ai-site.vercel.app/" },
];

const PARTNERS = [
  { t: "PHOENIX", d: "An accounting firm based in Dakar, to support your international development.", u: "https://www.phoenix-conseil.net/" },
  { t: "DECA Paris", d: "An employment law firm, a partner to secure your HR and labour-law matters.", u: "https://www.decaparis.fr/" },
  { t: "NewTech", d: "A specialist in automation and large language models (LLMs), to industrialise your AI use cases.", u: "https://www.newtech.institute/" },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Our Ecosystem</span>
          <h1>An ecosystem of <em>excellence</em> at your service</h1>
          <p>
            We bring together independent entities in accounting, audit and
            advisory, to guarantee exemplary service quality — in France and
            internationally.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">The TREVYS Group</span>
            <h2>Group <em>companies</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {GROUP.map((p) => (
              <a className="mkt-svc mkt-svc-link" href={p.u} target="_blank" rel="noopener noreferrer" key={p.t}>
                <span className="mkt-eco-mono" aria-hidden="true">{p.t.replace(/[^A-Za-z]/g, "").slice(0, 2)}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="mkt-svc-visit">Visit website ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Our partners</span>
            <h2><em>Complementary</em> expertise</h2>
          </div>
          <div className="mkt-svc-grid">
            {PARTNERS.map((p) => (
              <a className="mkt-svc mkt-svc-link" href={p.u} target="_blank" rel="noopener noreferrer" key={p.t}>
                <span className="mkt-eco-mono" aria-hidden="true">{p.t.replace(/[^A-Za-z]/g, "").slice(0, 2)}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <span className="mkt-svc-visit">Visit website ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>A need beyond accounting?</h2>
          <p>Our ecosystem mobilises the right expertise, at the right time, for your project.</p>
          <Link className="btn btn-gold" href="/en/contact">Talk to us</Link>
        </div>
      </section>
    </>
  );
}
