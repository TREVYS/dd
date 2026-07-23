// Mascotte de la réforme — un CHEF D'ORCHESTRE stylisé aux couleurs Trevys,
// tenant le drapeau français (réforme d'abord nationale) et le drapeau européen
// (cadre européen ViDA). SVG autonome + animations CSS (notes, drapeaux, flottement).

// Positions des 12 étoiles du drapeau européen (repère local ≈ centre (22,16), rayon 10).
const EU_STARS = [
  [22, 6], [27, 7.3], [30.7, 11], [32, 16], [30.7, 21], [27, 24.7],
  [22, 26], [17, 24.7], [13.3, 21], [12, 16], [13.3, 11], [17, 7.3],
];

function Star({ x, y }: { x: number; y: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(.5)`}
      d="M0 -4 L1.1 -1.2 L4 -1.2 L1.7 .7 L2.5 3.5 L0 1.8 L-2.5 3.5 L-1.7 .7 L-4 -1.2 L-1.1 -1.2 Z"
      fill="#FFCC00"
    />
  );
}

export function RfeMascot({ className = "" }: { className?: string }) {
  return (
    <div className={`mkt-rfe-mascot ${className}`} aria-hidden="true">
      <div className="mkt-ai-glow" />
      <svg viewBox="0 0 320 300" className="mkt-rfe-svg" role="img" aria-label="Chef d'orchestre Trevys tenant les drapeaux français et européen">
        <defs>
          <linearGradient id="rfe-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBB040" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <radialGradient id="rfe-skin" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#FFD9A8" />
            <stop offset="1" stopColor="#F5A65B" />
          </radialGradient>
        </defs>

        {/* Notes de musique flottantes */}
        <text className="mkt-note n1" x="44" y="150" fill="#F5811F" fontSize="20">♪</text>
        <text className="mkt-note n2" x="262" y="130" fill="#C2410C" fontSize="24">♫</text>
        <text className="mkt-note n3" x="70" y="96" fill="#FBB040" fontSize="16">♩</text>
        <text className="mkt-note n4" x="240" y="182" fill="#F5811F" fontSize="18">♪</text>

        {/* Mâts */}
        <line x1="112" y1="118" x2="96" y2="48" stroke="#7a5a3a" strokeWidth="4" strokeLinecap="round" />
        <line x1="208" y1="118" x2="224" y2="48" stroke="#7a5a3a" strokeWidth="4" strokeLinecap="round" />

        {/* Drapeau français (mât gauche) */}
        <g className="mkt-rfe-flag fr">
          <g transform="translate(50 44)">
            <rect x="0" y="0" width="46" height="32" rx="2" fill="#ED2939" />
            <rect x="0" y="0" width="30.7" height="32" fill="#fff" />
            <rect x="0" y="0" width="15.3" height="32" fill="#0055A4" />
          </g>
        </g>

        {/* Drapeau européen (mât droit) */}
        <g className="mkt-rfe-flag eu">
          <g transform="translate(224 44)">
            <rect x="0" y="0" width="46" height="32" rx="2" fill="#003399" />
            {EU_STARS.map(([x, y], i) => (
              <Star key={i} x={x + 1} y={y} />
            ))}
          </g>
        </g>

        {/* Estrade du chef d'orchestre */}
        <ellipse cx="160" cy="266" rx="70" ry="12" fill="#1f1206" opacity="0.12" />
        <rect x="120" y="250" width="80" height="16" rx="4" fill="url(#rfe-body)" />
        <rect x="120" y="250" width="80" height="6" rx="3" fill="#fff" fillOpacity="0.15" />

        {/* Queue-de-pie (corps) */}
        <path d="M130 150 L120 248 L145 236 L160 220 L175 236 L200 248 L190 150 Z" fill="url(#rfe-body)" />
        {/* Plastron / chemise */}
        <path d="M150 150 L150 214 L160 224 L170 214 L170 150 Z" fill="#fff" fillOpacity="0.9" />
        <circle cx="160" cy="176" r="1.8" fill="#C2410C" />
        <circle cx="160" cy="190" r="1.8" fill="#C2410C" />
        {/* Nœud papillon */}
        <path d="M160 150 L151 145 L151 155 Z" fill="#1f1206" />
        <path d="M160 150 L169 145 L169 155 Z" fill="#1f1206" />

        {/* Bras levés qui tiennent les mâts */}
        <line x1="140" y1="152" x2="112" y2="118" stroke="url(#rfe-body)" strokeWidth="11" strokeLinecap="round" />
        <line x1="180" y1="152" x2="208" y2="118" stroke="url(#rfe-body)" strokeWidth="11" strokeLinecap="round" />
        {/* Mains */}
        <circle cx="112" cy="116" r="6.5" fill="url(#rfe-skin)" />
        <circle cx="208" cy="116" r="6.5" fill="url(#rfe-skin)" />

        {/* Cou + tête */}
        <rect x="153" y="126" width="14" height="12" rx="4" fill="url(#rfe-skin)" />
        <circle cx="160" cy="108" r="23" fill="url(#rfe-skin)" />
        {/* Cheveux */}
        <path d="M138 104 A23 23 0 0 1 182 104 C176 96 168 92 160 92 C152 92 144 96 138 104 Z" fill="#3a2408" />
        {/* Yeux + sourire discret */}
        <circle cx="152" cy="108" r="2.1" fill="#3a2408" />
        <circle cx="168" cy="108" r="2.1" fill="#3a2408" />
        <path d="M153 116 Q160 121 167 116" fill="none" stroke="#8a4b1e" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
