// Illustration animée de la section « Notre approche » (expertise comptable) :
// un tableau de bord sécurisé — bouclier, courbe de croissance, orbites et
// pastilles flottantes. Animations CSS douces (désactivées si l'utilisateur
// préfère réduire les animations).
export function ApprocheArt() {
  return (
    <div className="mkt-appr-art" aria-hidden="true">
      <svg viewBox="0 0 420 360" className="mkt-appr-svg">
        <defs>
          <linearGradient id="apr-o" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F5A94F" />
            <stop offset="1" stopColor="#E26A0F" />
          </linearGradient>
          <linearGradient id="apr-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1BE4B" />
            <stop offset="1" stopColor="#C99527" />
          </linearGradient>
        </defs>

        {/* halo + orbites */}
        <circle cx="210" cy="180" r="150" fill="rgba(245,129,31,0.07)" />
        <circle cx="210" cy="180" r="112" fill="rgba(245,129,31,0.07)" />
        <g className="apr-orbit">
          <circle cx="210" cy="180" r="150" fill="none" stroke="rgba(226,106,15,0.35)" strokeWidth="1.4" strokeDasharray="4 10" />
          <circle cx="360" cy="180" r="6" fill="#E26A0F" />
          <circle cx="60" cy="180" r="4.5" fill="#E8B33C" />
        </g>

        {/* carte centrale : courbe de croissance */}
        <g className="apr-float-a">
          <rect x="120" y="98" width="180" height="128" rx="18" fill="#ffffff" stroke="#F0E2CF" strokeWidth="1.6" />
          <rect x="120" y="98" width="180" height="6" rx="3" fill="url(#apr-o)" />
          <path d="M142 196 L176 172 L204 182 L236 148 L272 128" fill="none" stroke="url(#apr-o)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="272" cy="128" r="6.5" fill="#E26A0F" />
          <circle cx="272" cy="128" r="12" fill="rgba(226,106,15,0.2)" />
          <rect x="142" y="206" width="26" height="6" rx="3" fill="#EFE3D2" />
          <rect x="176" y="206" width="46" height="6" rx="3" fill="#EFE3D2" />
        </g>

        {/* bouclier — la sécurité maximale */}
        <g className="apr-float-b">
          <path d="M96 176l34 13v22c0 21-13 34-34 42-21-8-34-21-34-42v-22z" fill="url(#apr-gold)" />
          <path d="M82 213l10 10 20-20" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* pastille € — le chiffre */}
        <g className="apr-float-c">
          <circle cx="318" cy="238" r="30" fill="#ffffff" stroke="#F0E2CF" strokeWidth="1.6" />
          <text x="318" y="250" textAnchor="middle" fontSize="32" fontWeight="800" fill="#E26A0F" fontFamily="Arial, sans-serif">€</text>
        </g>

        {/* petite carte check — la conformité */}
        <g className="apr-float-b">
          <rect x="256" y="64" width="96" height="40" rx="12" fill="#ffffff" stroke="#F0E2CF" strokeWidth="1.6" />
          <circle cx="278" cy="84" r="10" fill="rgba(46,158,107,0.14)" />
          <path d="M273 84l4 4 8-8" fill="none" stroke="#2E9E6B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="296" y="76" width="42" height="5" rx="2.5" fill="#EFE3D2" />
          <rect x="296" y="87" width="30" height="5" rx="2.5" fill="#EFE3D2" />
        </g>

        {/* points d'ambiance */}
        <circle className="apr-blink" cx="140" cy="66" r="4" fill="#E8B33C" />
        <circle className="apr-blink d2" cx="352" cy="300" r="3.5" fill="#E26A0F" />
        <circle className="apr-blink d3" cx="70" cy="300" r="3" fill="#F5A94F" />
      </svg>
    </div>
  );
}
