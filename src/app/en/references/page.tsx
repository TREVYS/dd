import type { Metadata } from "next";
import Link from "next/link";
import { RefLogo } from "../../(marketing)/references/ref-logo";
import { slugify } from "@/lib/blog";
import { SECTORS } from "@/lib/sectors";
import { SectorArt } from "../../(marketing)/_components/sector-art";

export const metadata: Metadata = {
  title: "References",
  description:
    "Trevys supports major finance players and companies across all industries: banking, gaming, services, healthcare, nonprofits, industry, real estate.",
  alternates: { canonical: "/en/references", languages: { fr: "https://www.trevys.fr/references" } },
};

const CLIENTS: { name: string; domain?: string }[] = [
  { name: "AG2R La Mondiale", domain: "ag2rlamondiale.fr" },
  { name: "EDF", domain: "edf.fr" },
  { name: "BPCE Groupe", domain: "bpce.fr" },
  { name: "BPCE SI", domain: "bpce.fr" },
  { name: "BNP AM", domain: "bnpparibas-am.com" },
  { name: "Natixis", domain: "natixis.com" },
  { name: "LCL", domain: "lcl.fr" },
  { name: "La Banque Postale", domain: "labanquepostale.fr" },
  { name: "Cardif", domain: "bnpparibascardif.com" },
  { name: "Edmond de Rothschild", domain: "edmond-de-rothschild.com" },
  { name: "Roole", domain: "roole.fr" },
  { name: "Sportfive", domain: "sportfive.com" },
  { name: "Publicis", domain: "publicis.com" },
  { name: "Lapeyre", domain: "lapeyre.fr" },
  { name: "Handy'Up" },
  { name: "Leano" },
  { name: "Jeux&Co" },
  { name: "Ekin" },
  { name: "Ulas Istanbul" },
  { name: "Jaji" },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">References</span>
          <h1>Trusted by major <em>finance players</em></h1>
          <p>
            Banks, groups, studios, SMEs: our teams work alongside demanding
            organisations, in accounting as well as consulting for finance
            departments.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">They trust us</span>
            <h2>Some <em>references</em></h2>
          </div>
          <div className="mkt-refs-grid">
            {CLIENTS.map((c) => {
              const slug = slugify(c.name);
              const srcs = [
                ...(c.domain ? [`https://logo.clearbit.com/${c.domain}?size=200`] : []),
                `/uploads/refs/${slug}.png`,
              ];
              return (
                <div className="mkt-ref-card" key={c.name}>
                  <RefLogo name={c.name} srcs={srcs} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Your industry</span>
            <h2>Expertise for <em>your industry</em></h2>
          </div>
          <div className="mkt-sector-grid">
            {SECTORS.map((s) => (
              <div className="mkt-sector-card mkt-consultant" key={s.slug}>
                <div className="mkt-sector-thumb"><SectorArt art={s.art} title={s.title} /></div>
                <div className="mkt-sector-body">
                  <div className="nm">{s.title}</div>
                  <p>{s.tagline}</p>
                  <div className="mkt-team-foot">
                    <Link className="mkt-consultant-more mkt-stretch" href={`/secteurs/${s.slug}`}>
                      <span className="mkt-more-txt">Learn more </span>→
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
          <h2>What if you were our next reference?</h2>
          <p>Join the organisations that turned their accounting into an advantage.</p>
          <Link className="btn btn-gold" href="/en/contact">Work with us</Link>
        </div>
      </section>
    </>
  );
}
