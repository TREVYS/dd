// Mascotte de la réforme — un CHEF D'ORCHESTRE élégant aux couleurs Trevys,
// qui dirige avec ses baguettes, encadré par le drapeau français (à gauche) et
// le drapeau européen (à droite), posés sur leurs mâts. SVG + animations CSS.

// Étoiles du drapeau européen (repère local ≈ centre (22,16), rayon 10).
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
      <svg viewBox="0 0 340 300" className="mkt-rfe-svg" role="img" aria-label="Chef d'orchestre Trevys entre le drapeau français et le drapeau européen">
        <defs>
          <linearGradient id="rfe-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBB040" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <radialGradient id="rfe-skin" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0" stopColor="#FFD9A8" />
            <stop offset="1" stopColor="#F0A45C" />
          </radialGradient>
          <radialGradient id="rfe-spot" cx="0.5" cy="0" r="0.9">
            <stop offset="0" stopColor="#FBB040" stopOpacity="0.28" />
            <stop offset="1" stopColor="#FBB040" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo de projecteur */}
        <path d="M170 40 L250 250 L90 250 Z" fill="url(#rfe-spot)" />

        {/* Notes de musique */}
        <text className="mkt-note n1" x="120" y="70" fill="#F5811F" fontSize="18">♪</text>
        <text className="mkt-note n2" x="214" y="82" fill="#C2410C" fontSize="22">♫</text>
        <text className="mkt-note n3" x="150" y="52" fill="#FBB040" fontSize="15">♩</text>

        {/* ===== Drapeau français (mât gauche) ===== */}
        <ellipse cx="44" cy="252" rx="16" ry="5" fill="#1f1206" opacity="0.14" />
        <line x1="44" y1="250" x2="44" y2="40" stroke="#8a6a44" strokeWidth="4" strokeLinecap="round" />
        <circle cx="44" cy="38" r="5" fill="url(#rfe-body)" />
        <g className="mkt-rfe-flag fr">
          <g transform="translate(44 46)">
            <rect x="0" y="0" width="46" height="34" rx="2" fill="#ED2939" />
            <rect x="0" y="0" width="30.7" height="34" fill="#fff" />
            <rect x="0" y="0" width="15.3" height="34" fill="#0055A4" />
          </g>
        </g>

        {/* ===== Drapeau européen (mât droit) ===== */}
        <ellipse cx="296" cy="252" rx="16" ry="5" fill="#1f1206" opacity="0.14" />
        <line x1="296" y1="250" x2="296" y2="40" stroke="#8a6a44" strokeWidth="4" strokeLinecap="round" />
        <circle cx="296" cy="38" r="5" fill="url(#rfe-body)" />
        <g className="mkt-rfe-flag eu">
          <g transform="translate(250 46)">
            <rect x="0" y="0" width="46" height="34" rx="2" fill="#003399" />
            {EU_STARS.map(([x, y], i) => (
              <Star key={i} x={x} y={y + 1} />
            ))}
          </g>
        </g>

        {/* ===== Chef d'orchestre ===== */}
        {/* Estrade */}
        <ellipse cx="170" cy="268" rx="66" ry="11" fill="#1f1206" opacity="0.12" />
        <rect x="132" y="252" width="76" height="16" rx="4" fill="url(#rfe-body)" />
        <rect x="132" y="252" width="76" height="6" rx="3" fill="#fff" fillOpacity="0.15" />

        {/* Baguettes */}
        <g className="mkt-rfe-baton">
          <line x1="130" y1="150" x2="106" y2="120" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="210" y1="150" x2="234" y2="120" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* Queue-de-pie */}
        <path d="M143 150 L133 244 L157 233 L170 216 L183 233 L207 244 L197 150 Z" fill="url(#rfe-body)" />
        {/* Plastron */}
        <path d="M158 150 L158 212 L170 222 L182 212 L182 150 Z" fill="#fff" fillOpacity="0.92" />
        <circle cx="170" cy="176" r="1.7" fill="#C2410C" />
        <circle cx="170" cy="189" r="1.7" fill="#C2410C" />
        {/* Nœud papillon */}
        <path d="M170 150 L162 146 L162 154 Z" fill="#1f1206" />
        <path d="M170 150 L178 146 L178 154 Z" fill="#1f1206" />
        <rect x="168" y="148.5" width="4" height="3.5" rx="1" fill="#1f1206" />

        {/* Bras levés (mains vers les baguettes) */}
        <line x1="150" y1="152" x2="130" y2="150" stroke="url(#rfe-body)" strokeWidth="11" strokeLinecap="round" />
        <line x1="190" y1="152" x2="210" y2="150" stroke="url(#rfe-body)" strokeWidth="11" strokeLinecap="round" />
        <circle cx="130" cy="150" r="5.5" fill="url(#rfe-skin)" />
        <circle cx="210" cy="150" r="5.5" fill="url(#rfe-skin)" />

        {/* Cou + tête */}
        <rect x="163" y="126" width="14" height="12" rx="4" fill="url(#rfe-skin)" />
        <ellipse cx="170" cy="106" rx="22" ry="24" fill="url(#rfe-skin)" />
        {/* Chevelure élégante */}
        <path d="M148 104 C146 86 156 74 170 74 C184 74 194 86 192 104 C188 96 182 92 170 92 C158 92 152 96 148 104 Z" fill="#3a2408" />
        <path d="M148 104 C148 96 152 92 156 90 C152 96 150 100 150 106 Z" fill="#2a1a06" />
        {/* Sourcils, yeux, sourire */}
        <path d="M158 102 q4 -2 8 0" fill="none" stroke="#5a3d1e" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M174 102 q4 -2 8 0" fill="none" stroke="#5a3d1e" strokeWidth="1.5" strokeLinecap="round" />
        <circle className="mkt-ai-eye" cx="163" cy="106" r="2.1" fill="#3a2e26" />
        <circle className="mkt-ai-eye d2" cx="177" cy="106" r="2.1" fill="#3a2e26" />
        <path d="M163 116 Q170 121 177 116" fill="none" stroke="#B07A4A" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
