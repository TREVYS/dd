// Visuels de secteur : illustrations vectorielles futuristes aux couleurs
// Trevys (fond sombre, lueurs orange, réseau de données). Un motif par secteur.
// Aucune ressource externe — jamais d'image cassée.

const O = "#F5811F";
const GOLD = "#E8B33C";
const DIM = "rgba(245,129,31,0.35)";
const FAINT = "rgba(245,129,31,0.18)";

function Motif({ art }: { art: string }) {
  switch (art) {
    case "banque":
      return (
        <g>
          {/* skyline de tours + bouclier */}
          <path d="M40 150V96h22v54zM70 150V72h26v78zM104 150V88h22v62zM134 150V60h28v90z" fill="none" stroke={DIM} strokeWidth="2" />
          <path d="M148 74v-8M141 66h14" stroke={DIM} strokeWidth="2" />
          <path d="M215 58l30 12v20c0 19-12 31-30 38-18-7-30-19-30-38V70z" fill="rgba(245,129,31,0.10)" stroke={O} strokeWidth="2.4" />
          <path d="M203 92l8 8 17-17" stroke={GOLD} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="215" cy="42" r="3.5" fill={GOLD} />
        </g>
      );
    case "jeux":
      return (
        <g>
          {/* manette stylisée + pixels */}
          <rect x="60" y="78" width="150" height="64" rx="32" fill="rgba(245,129,31,0.10)" stroke={O} strokeWidth="2.4" />
          <path d="M96 100v20M86 110h20" stroke={GOLD} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="172" cy="102" r="5" fill={O} />
          <circle cx="188" cy="114" r="5" fill={GOLD} />
          <rect x="228" y="60" width="12" height="12" fill={DIM} />
          <rect x="244" y="76" width="12" height="12" fill={O} />
          <rect x="228" y="92" width="12" height="12" fill={FAINT} />
          <rect x="244" y="108" width="12" height="12" fill={GOLD} />
        </g>
      );
    case "services":
      return (
        <g>
          {/* réseau de collaboration */}
          <path d="M70 130L130 70L190 120L250 60" stroke={DIM} strokeWidth="2" fill="none" />
          <path d="M130 70L190 60L250 60M130 70L190 120" stroke={FAINT} strokeWidth="1.6" fill="none" />
          <circle cx="70" cy="130" r="9" fill="none" stroke={O} strokeWidth="2.4" />
          <circle cx="130" cy="70" r="12" fill="rgba(245,129,31,0.12)" stroke={O} strokeWidth="2.4" />
          <circle cx="190" cy="120" r="9" fill="none" stroke={GOLD} strokeWidth="2.4" />
          <circle cx="250" cy="60" r="12" fill={O} />
          <circle cx="250" cy="60" r="4.5" fill="#fff" />
          <circle cx="190" cy="60" r="4" fill={GOLD} />
        </g>
      );
    case "sante":
      return (
        <g>
          {/* croix + pulsation */}
          <rect x="78" y="66" width="70" height="70" rx="18" fill="rgba(245,129,31,0.10)" stroke={O} strokeWidth="2.4" />
          <path d="M113 86v30M98 101h30" stroke={GOLD} strokeWidth="5" strokeLinecap="round" />
          <path d="M170 101h18l8-18 12 38 10-24 6 4h24" stroke={O} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="248" cy="101" r="4" fill={GOLD} />
        </g>
      );
    case "association":
      return (
        <g>
          {/* cercle de personnes reliées */}
          <circle cx="160" cy="102" r="46" fill="none" stroke={FAINT} strokeWidth="1.6" strokeDasharray="3 8" />
          <circle cx="160" cy="56" r="9" fill={O} />
          <circle cx="204" cy="88" r="9" fill="none" stroke={GOLD} strokeWidth="2.4" />
          <circle cx="188" cy="140" r="9" fill="none" stroke={O} strokeWidth="2.4" />
          <circle cx="132" cy="140" r="9" fill={GOLD} />
          <circle cx="116" cy="88" r="9" fill="none" stroke={O} strokeWidth="2.4" />
          <path d="M160 65v28M160 93l-38-2M160 93l40-3M160 93l-26 40M160 93l24 40" stroke={DIM} strokeWidth="1.6" />
          <circle cx="160" cy="93" r="5" fill="#fff" />
        </g>
      );
    case "industrie":
      return (
        <g>
          {/* usine + engrenage */}
          <path d="M56 142V96l34 20V96l34 20V96l34 20v26z" fill="rgba(245,129,31,0.10)" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M66 96V72h12v24" stroke={DIM} strokeWidth="2.4" fill="none" />
          <g stroke={GOLD} strokeWidth="2.6" fill="none">
            <circle cx="222" cy="88" r="17" />
            <circle cx="222" cy="88" r="6" />
            <path d="M222 63v10M222 103v10M247 88h-10M207 88h-10M240 70l-7 7M211 99l-7 7M240 106l-7-7M211 77l-7-7" strokeLinecap="round" />
          </g>
        </g>
      );
    case "immobilier":
    default:
      return (
        <g>
          {/* immeubles + clé de données */}
          <path d="M70 146V70h44v76M130 146V92h40v54" fill="rgba(245,129,31,0.08)" stroke={O} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M82 84h8M82 100h8M82 116h8M100 84h8M100 100h8M142 104h8M142 120h8M158 104h4" stroke={DIM} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="222" cy="86" r="14" fill="none" stroke={GOLD} strokeWidth="2.6" />
          <path d="M232 96l18 18M242 106l7-7M248 118l6-6" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </g>
      );
  }
}

export function SectorArt({ art, title, banner = false }: { art: string; title: string; banner?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label={title}
      className={banner ? "mkt-sector-art banner" : "mkt-sector-art"}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`sbg-${art}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#150e07" />
          <stop offset=".6" stopColor="#1c1207" />
          <stop offset="1" stopColor="#2a1808" />
        </linearGradient>
        <radialGradient id={`sglow-${art}`} cx=".8" cy=".15" r=".9">
          <stop offset="0" stopColor="rgba(245,129,31,0.35)" />
          <stop offset=".6" stopColor="rgba(245,129,31,0)" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={`url(#sbg-${art})`} />
      <rect width="320" height="200" fill={`url(#sglow-${art})`} />
      {/* orbites d'ambiance */}
      <circle cx="268" cy="30" r="70" fill="none" stroke={FAINT} strokeWidth="1" />
      <circle cx="268" cy="30" r="46" fill="none" stroke={FAINT} strokeWidth="1" strokeDasharray="3 8" />
      <path d="M0 176 L90 150 L180 168 L320 140" stroke={FAINT} strokeWidth="1.2" fill="none" />
      <circle cx="90" cy="150" r="3" fill={O} />
      <circle cx="180" cy="168" r="2.5" fill={GOLD} />
      <Motif art={art} />
    </svg>
  );
}
