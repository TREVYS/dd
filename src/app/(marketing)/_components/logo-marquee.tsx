import { RefLogo } from "../references/ref-logo";

type Item = { src?: string; text?: string; alt: string };

// Accueil : 6 références phares, avec leur vrai logo (repli sur le nom).
const CLIENTS_FEATURED: { name: string; domain: string }[] = [
  { name: "Groupe BPCE", domain: "bpce.fr" },
  { name: "LCL", domain: "lcl.fr" },
  { name: "EDF", domain: "edf.fr" },
  { name: "AG2R La Mondiale", domain: "ag2rlamondiale.fr" },
  { name: "Natixis", domain: "natixis.com" },
  { name: "Publicis", domain: "publicis.com" },
];

// Outils que nous maîtrisons et déployons chez nos clients.
const TOOLS: Item[] = [
  { text: "Tiime", alt: "Tiime" },
  { text: "Sage", alt: "Sage" },
  { text: "Pennylane", alt: "Pennylane" },
  { text: "Fulll", alt: "Fulll" },
  { text: "SAP", alt: "SAP" },
  { text: "Cegid", alt: "Cegid" },
  { text: "Yooz", alt: "Yooz" },
  { text: "Oracle", alt: "Oracle" },
  { text: "Microsoft Dynamics", alt: "Microsoft Dynamics" },
  { text: "Trello", alt: "Trello" },
  { text: "Jira", alt: "Jira" },
  { text: "Power BI", alt: "Power BI" },
];

function Row({ items, reverse, label }: { items: Item[]; reverse?: boolean; label: string }) {
  const loop = [...items, ...items];
  return (
    <div className="mkt-marq-row" aria-label={label}>
      <div className={`mkt-marq-track${reverse ? " rev" : ""}`}>
        {loop.map((it, i) => (
          <span
            className={`mkt-marq-logo${it.text ? " txt" : ""}`}
            key={`${it.alt}-${i}`}
          >
            {it.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.src} alt={i < items.length ? it.alt : ""} loading="lazy" />
            ) : (
              it.text
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LogoMarquee() {
  return (
    <section className="mkt-marq" aria-labelledby="marq-title">
      <div className="wrap">
        <p className="eyebrow" id="marq-title">
          Ils nous font confiance · Nos outils
        </p>
        <div className="mkt-marq-featured">
          {CLIENTS_FEATURED.map((c) => (
            <div className="mkt-ref-card" key={c.name}>
              <RefLogo name={c.name} srcs={[`https://logo.clearbit.com/${c.domain}?size=200`]} />
            </div>
          ))}
        </div>
      </div>
      <Row items={TOOLS} reverse label="Outils utilisés au cabinet et chez nos clients" />
    </section>
  );
}
