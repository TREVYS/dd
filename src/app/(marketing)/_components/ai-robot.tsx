// Robot IA animé — SVG autonome (aucune image externe), aux couleurs Trevys.
// Animations en CSS pures (flottement, orbites, clignement, halo) : léger et
// respectueux de prefers-reduced-motion (voir marketing.css).
export function AiRobot({ className = "" }: { className?: string }) {
  return (
    <div className={`mkt-ai-robot ${className}`} aria-hidden="true">
      <div className="mkt-ai-glow" />
      <svg viewBox="0 0 260 300" className="mkt-ai-svg" role="img" aria-label="Robot IA Trevys">
        <defs>
          <linearGradient id="airobo-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBB040" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="airobo-visor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b1200" />
            <stop offset="1" stopColor="#3a2408" />
          </linearGradient>
          <radialGradient id="airobo-eye" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFE7C2" />
            <stop offset="0.5" stopColor="#FBB040" />
            <stop offset="1" stopColor="#F5811F" />
          </radialGradient>
        </defs>

        {/* Orbites (anneaux qui tournent) */}
        <g className="mkt-ai-orbit">
          <ellipse cx="130" cy="150" rx="118" ry="46" fill="none" stroke="#F5811F" strokeOpacity="0.35" strokeWidth="1.5" />
          <circle className="mkt-ai-orbit-dot" cx="248" cy="150" r="4" fill="#F5811F" />
        </g>
        <g className="mkt-ai-orbit rev">
          <ellipse cx="130" cy="150" rx="60" ry="120" fill="none" stroke="#C2410C" strokeOpacity="0.25" strokeWidth="1.5" />
          <circle className="mkt-ai-orbit-dot" cx="130" cy="30" r="3.5" fill="#C2410C" />
        </g>

        {/* Antenne */}
        <line x1="130" y1="70" x2="130" y2="44" stroke="url(#airobo-body)" strokeWidth="4" strokeLinecap="round" />
        <circle className="mkt-ai-antenna" cx="130" cy="40" r="7" fill="url(#airobo-eye)" />

        {/* Tête */}
        <rect x="70" y="72" width="120" height="98" rx="30" fill="url(#airobo-body)" />
        <rect x="70" y="72" width="120" height="98" rx="30" fill="#fff" fillOpacity="0.06" />
        {/* Oreilles */}
        <rect x="58" y="104" width="12" height="34" rx="6" fill="url(#airobo-body)" />
        <rect x="190" y="104" width="12" height="34" rx="6" fill="url(#airobo-body)" />

        {/* Visière */}
        <rect x="86" y="92" width="88" height="58" rx="24" fill="url(#airobo-visor)" />
        {/* Yeux */}
        <circle className="mkt-ai-eye" cx="112" cy="121" r="11" fill="url(#airobo-eye)" />
        <circle className="mkt-ai-eye d2" cx="148" cy="121" r="11" fill="url(#airobo-eye)" />
        {/* Sourire de données */}
        <path d="M114 140 Q130 150 146 140" fill="none" stroke="#FBB040" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" />

        {/* Corps */}
        <rect x="92" y="178" width="76" height="66" rx="20" fill="url(#airobo-body)" />
        <rect x="92" y="178" width="76" height="66" rx="20" fill="#fff" fillOpacity="0.05" />
        {/* Cœur / puce qui pulse */}
        <rect className="mkt-ai-core" x="118" y="200" width="24" height="24" rx="7" fill="url(#airobo-eye)" />
        {/* Bras */}
        <rect x="72" y="186" width="14" height="44" rx="7" fill="url(#airobo-body)" />
        <rect x="174" y="186" width="14" height="44" rx="7" fill="url(#airobo-body)" />
      </svg>
    </div>
  );
}
