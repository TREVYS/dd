// Visuel de la page 404 : un grand « 404 » dégradé, la baguette du chef posée
// en travers et quelques notes qui s'échappent. SVG + CSS, aucune ressource
// externe. Animations coupées si prefers-reduced-motion.
export function LostMascots() {
  return (
    <div className="mkt-404-art" aria-hidden="true">
      <svg viewBox="0 0 420 240" className="mkt-404-svg" role="img" aria-label="Erreur 404">
        <defs>
          <linearGradient id="lm-o" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F5A94F" />
            <stop offset="1" stopColor="#E26A0F" />
          </linearGradient>
          <linearGradient id="lm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1BE4B" />
            <stop offset="1" stopColor="#C99527" />
          </linearGradient>
        </defs>

        {/* halo + orbite pointillée */}
        <circle cx="210" cy="120" r="104" fill="rgba(245,129,31,0.06)" />
        <g className="lm-orbit">
          <circle cx="210" cy="120" r="104" fill="none" stroke="rgba(226,106,15,0.25)" strokeWidth="1.3" strokeDasharray="3 10" />
          <circle cx="314" cy="120" r="4.5" fill="#E8B33C" />
          <circle cx="106" cy="120" r="3.5" fill="#F5811F" />
        </g>

        {/* le grand 404 */}
        <text
          x="210" y="158" textAnchor="middle"
          fontFamily="Arial, sans-serif" fontSize="118" fontWeight="800"
          fill="url(#lm-o)" letterSpacing="4"
        >
          404
        </text>

        {/* la baguette égarée, posée en travers */}
        <g className="lm-baton">
          <path d="M118 186 L302 156" stroke="url(#lm-gold)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="308" cy="155" r="5" fill="#E8B33C" />
        </g>

        {/* notes qui s'échappent */}
        <g className="lm-float-a" fill="url(#lm-o)">
          <ellipse cx="128" cy="58" rx="7" ry="5.4" transform="rotate(-18 128 58)" />
          <path d="M134 56 V26 h2.6 V56z" />
          <path d="M134 26 q12 3 14 12 q-7 -6 -14 -4z" />
        </g>
        <g className="lm-float-b" fill="url(#lm-gold)">
          <ellipse cx="296" cy="66" rx="6" ry="4.6" transform="rotate(-18 296 66)" />
          <path d="M301 64 V40 h2.4 V64z" />
        </g>
        <g className="lm-float-c" fill="rgba(226,106,15,0.55)">
          <ellipse cx="222" cy="34" rx="5" ry="3.8" transform="rotate(-18 222 34)" />
          <path d="M226 32 V14 h2 V32z" />
        </g>
      </svg>
    </div>
  );
}
