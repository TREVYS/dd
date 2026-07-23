// Mascotte animée de la réforme — robot aux couleurs Trevys tenant le drapeau
// français (la réforme est d'abord nationale) et le drapeau européen (elle
// s'inscrit dans le cadre européen ViDA). SVG autonome + animations CSS.

// Positions des 12 étoiles du drapeau européen, en cercle (repère local du
// drapeau : centre ≈ (22,16), rayon 10).
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
      <svg viewBox="0 0 320 300" className="mkt-rfe-svg" role="img" aria-label="Mascotte Trevys tenant les drapeaux français et européen">
        <defs>
          <linearGradient id="rfe-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBB040" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <radialGradient id="rfe-eye" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFE7C2" />
            <stop offset="0.6" stopColor="#FBB040" />
            <stop offset="1" stopColor="#F5811F" />
          </radialGradient>
        </defs>

        {/* Mâts */}
        <line x1="120" y1="212" x2="96" y2="48" stroke="#7a5a3a" strokeWidth="4" strokeLinecap="round" />
        <line x1="200" y1="212" x2="224" y2="48" stroke="#7a5a3a" strokeWidth="4" strokeLinecap="round" />

        {/* Drapeau français (mât gauche, flotte vers la gauche) */}
        <g className="mkt-rfe-flag fr">
          <g transform="translate(50 44)">
            <rect x="0" y="0" width="46" height="32" rx="2" fill="#ED2939" />
            <rect x="0" y="0" width="30.7" height="32" fill="#fff" />
            <rect x="0" y="0" width="15.3" height="32" fill="#0055A4" />
          </g>
        </g>

        {/* Drapeau européen (mât droit, flotte vers la droite) */}
        <g className="mkt-rfe-flag eu">
          <g transform="translate(224 44)">
            <rect x="0" y="0" width="46" height="32" rx="2" fill="#003399" />
            {EU_STARS.map(([x, y], i) => (
              <Star key={i} x={x + 1} y={y} />
            ))}
          </g>
        </g>

        {/* Orbite décorative */}
        <g className="mkt-ai-orbit">
          <ellipse cx="160" cy="180" rx="96" ry="30" fill="none" stroke="#F5811F" strokeOpacity="0.3" strokeWidth="1.5" />
          <circle className="mkt-ai-orbit-dot" cx="256" cy="180" r="3.5" fill="#F5811F" />
        </g>

        {/* Antenne */}
        <line x1="160" y1="118" x2="160" y2="96" stroke="url(#rfe-body)" strokeWidth="4" strokeLinecap="round" />
        <circle className="mkt-ai-antenna" cx="160" cy="92" r="6" fill="url(#rfe-eye)" />

        {/* Tête */}
        <rect x="112" y="118" width="96" height="80" rx="26" fill="url(#rfe-body)" />
        <rect x="112" y="118" width="96" height="80" rx="26" fill="#fff" fillOpacity="0.06" />
        <rect x="102" y="144" width="10" height="28" rx="5" fill="url(#rfe-body)" />
        <rect x="208" y="144" width="10" height="28" rx="5" fill="url(#rfe-body)" />

        {/* Visière + yeux */}
        <rect x="124" y="134" width="72" height="48" rx="20" fill="#1f1206" />
        <circle className="mkt-ai-eye" cx="146" cy="158" r="9" fill="url(#rfe-eye)" />
        <circle className="mkt-ai-eye d2" cx="174" cy="158" r="9" fill="url(#rfe-eye)" />
        <path d="M146 174 Q160 182 174 174" fill="none" stroke="#FBB040" strokeOpacity="0.7" strokeWidth="2.2" strokeLinecap="round" />

        {/* Corps */}
        <rect x="128" y="204" width="64" height="54" rx="18" fill="url(#rfe-body)" />
        <rect className="mkt-ai-core" x="150" y="222" width="20" height="20" rx="6" fill="url(#rfe-eye)" />

        {/* Bras qui tiennent les mâts */}
        <line x1="132" y1="212" x2="120" y2="212" stroke="url(#rfe-body)" strokeWidth="12" strokeLinecap="round" />
        <line x1="188" y1="212" x2="200" y2="212" stroke="url(#rfe-body)" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </div>
  );
}
