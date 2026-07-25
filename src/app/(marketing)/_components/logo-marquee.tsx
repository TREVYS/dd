type Item = { src?: string; text?: string; alt: string };

// Accueil : nos références phares, en défilé (marquee). Rendues en toutes
// lettres pour un affichage fiable (pas de logo externe qui casse).
const CLIENTS: Item[] = [
  { text: "Groupe BPCE", alt: "Groupe BPCE" },
  { text: "LCL", alt: "LCL" },
  { text: "EDF", alt: "EDF" },
  { text: "AG2R La Mondiale", alt: "AG2R La Mondiale" },
  { text: "Natixis", alt: "Natixis" },
  { text: "Publicis", alt: "Publicis" },
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
      </div>
      <Row items={CLIENTS} label="Références du cabinet" />
      <Row items={TOOLS} reverse label="Outils utilisés au cabinet et chez nos clients" />
    </section>
  );
}
