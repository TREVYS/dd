const U = "https://www.trevys-advisory.fr/wp-content/uploads";

type Item = { src?: string; text?: string; alt: string };

// Mix : logos-images (hébergés sur le WordPress) + marques en toutes-lettres
// (celles sans fichier logo à ce stade).
const CLIENTS: Item[] = [
  { text: "AG2R La Mondiale", alt: "AG2R La Mondiale" },
  { src: `${U}/2025/02/BNP-AM.png`, alt: "BNP AM" },
  { text: "Banque Populaire", alt: "Banque Populaire" },
  { src: `${U}/2025/02/BPCE-GROUPE.png`, alt: "BPCE Groupe" },
  { text: "Caisse d'Épargne", alt: "Caisse d'Épargne" },
  { src: `${U}/2025/02/natixis.png`, alt: "Natixis" },
  { text: "BRED", alt: "BRED" },
  { src: `${U}/2025/02/BPCE-SI.png`, alt: "BPCE SI" },
  { src: `${U}/2025/02/LCL.png`, alt: "LCL" },
  { text: "Oney", alt: "Oney" },
  { src: `${U}/2025/02/cardif.png`, alt: "Cardif" },
  { src: `${U}/2025/02/LBP.png`, alt: "La Banque Postale" },
  { text: "Roole Assurance", alt: "Roole Assurance" },
  { src: `${U}/2025/02/Edmon-de.png`, alt: "Edmond de Rothschild" },
  { text: "Sportfive France", alt: "Sportfive France" },
  { src: `${U}/2025/02/Publicis.png`, alt: "Publicis" },
  { text: "Lapeyre", alt: "Lapeyre" },
  { text: "Handy'Up", alt: "Handy'Up" },
  { src: `${U}/2025/02/Leano-LOGO.png`, alt: "Leano" },
  { src: `${U}/2025/02/logo_jeuxAndCo_small.png`, alt: "Jeux&Co" },
  { src: `${U}/2025/02/Logo_Ekin_Noir.png`, alt: "Ekin" },
  { src: `${U}/2025/02/ulas-istanbul-logo-01.png`, alt: "Ulas Istanbul" },
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
      <Row items={CLIENTS} label="Clients du cabinet" />
      <Row items={TOOLS} reverse label="Outils utilisés au cabinet et chez nos clients" />
    </section>
  );
}
