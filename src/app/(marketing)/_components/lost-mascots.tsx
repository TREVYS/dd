// Duo de mascottes pour la page 404 : le chef d'orchestre et le robot Trevys,
// un peu perdus (point d'interrogation, baguette qui cherche). SVG + CSS,
// aucune ressource externe. Animations coupées si prefers-reduced-motion.
export function LostMascots() {
  return (
    <div className="mkt-404-art" aria-hidden="true">
      <svg viewBox="0 0 420 300" className="mkt-404-svg" role="img" aria-label="Le chef d'orchestre et le robot Trevys, un peu perdus">
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

        {/* halo + orbites */}
        <circle cx="210" cy="150" r="128" fill="rgba(245,129,31,0.06)" />
        <g className="lm-orbit">
          <circle cx="210" cy="150" r="128" fill="none" stroke="rgba(226,106,15,0.28)" strokeWidth="1.3" strokeDasharray="3 10" />
          <circle cx="338" cy="150" r="5" fill="#E8B33C" />
          <circle cx="82" cy="150" r="4" fill="#F5811F" />
        </g>

        {/* « 404 » en filigrane */}
        <text x="210" y="182" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="150" fontWeight="800" fill="rgba(245,129,31,0.08)" letterSpacing="6">404</text>

        {/* Point d'interrogation flottant */}
        <g className="lm-float-c">
          <text x="210" y="52" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="46" fontWeight="800" fill="url(#lm-o)">?</text>
        </g>

        {/* Chef d'orchestre (gauche) */}
        <g className="lm-float-a" transform="translate(96 96)">
          <circle cx="34" cy="26" r="19" fill="url(#lm-o)" />
          {/* moustache / sourire perplexe */}
          <path d="M26 30c4 3 12 3 16 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="22" r="2.2" fill="#fff" />
          <circle cx="40" cy="22" r="2.2" fill="#fff" />
          {/* buste / queue-de-pie */}
          <path d="M34 46C14 52 8 74 8 104h52c0-30-6-52-26-58z" fill="rgba(245,129,31,0.12)" stroke="url(#lm-o)" strokeWidth="2.6" />
          {/* nœud papillon doré */}
          <path d="M34 50l-8-4v10zM34 50l8-4v10z" fill="url(#lm-gold)" />
          {/* bras + baguette qui cherche */}
          <path d="M12 70 L-14 54" stroke="url(#lm-o)" strokeWidth="2.6" strokeLinecap="round" />
          <g className="lm-baton">
            <path d="M-14 54 L-34 44" stroke="url(#lm-gold)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-36" cy="43" r="3.5" fill="#E8B33C" />
          </g>
          <path d="M56 70 L78 58" stroke="url(#lm-o)" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* Robot (droite) */}
        <g className="lm-float-b" transform="translate(250 104)">
          <path d="M30 22 V8" stroke="url(#lm-gold)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="30" cy="4" r="5" fill="#E8B33C" className="lm-blink" />
          <rect x="-14" y="22" width="88" height="66" rx="22" fill="rgba(245,129,31,0.12)" stroke="url(#lm-o)" strokeWidth="2.6" />
          {/* visière + yeux (un sourcil levé, perplexe) */}
          <rect x="2" y="42" width="56" height="20" rx="10" fill="#1a1208" stroke="url(#lm-o)" strokeWidth="2" />
          <circle cx="18" cy="52" r="5" fill="#F5811F" className="lm-blink" />
          <circle cx="42" cy="52" r="5" fill="#E8B33C" />
          <path d="M10 36l14-4" stroke="url(#lm-o)" strokeWidth="2.4" strokeLinecap="round" />
          {/* bouche zigzag « hmm » */}
          <path d="M18 74 l6 -4 6 4 6 -4 6 4" stroke="rgba(245,129,31,0.7)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-14 96 h-14 M74 96 h14" stroke="rgba(245,129,31,0.6)" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
