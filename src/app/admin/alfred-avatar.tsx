// Avatar d'Alfred — majordome façon « Alfred de Batman » (SVG animé, autonome).
export function AlfredAvatar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`adm-alfred-svg ${className}`} role="img" aria-label="Alfred, votre majordome de la communication">
      <defs>
        <radialGradient id="alf-skin" cx="0.5" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#F2C9A0" />
          <stop offset="1" stopColor="#D9A876" />
        </radialGradient>
      </defs>

      {/* Épaules / veston */}
      <path d="M6 80 C6 60 22 53 40 53 C58 53 74 60 74 80 Z" fill="#20242e" />
      {/* Col de chemise */}
      <path d="M40 53 L30 60 L40 69 Z" fill="#ffffff" />
      <path d="M40 53 L50 60 L40 69 Z" fill="#eef0f2" />
      {/* Nœud papillon */}
      <path d="M40 60 L32 56 L32 65 Z" fill="#111418" />
      <path d="M40 60 L48 56 L48 65 Z" fill="#111418" />
      <rect x="38" y="58" width="4" height="4" rx="1" fill="#111418" />

      {/* Cou */}
      <rect x="34" y="46" width="12" height="12" rx="4" fill="url(#alf-skin)" />
      {/* Oreilles */}
      <circle cx="21" cy="36" r="4" fill="url(#alf-skin)" />
      <circle cx="59" cy="36" r="4" fill="url(#alf-skin)" />
      {/* Tête */}
      <ellipse cx="40" cy="33" rx="19" ry="21" fill="url(#alf-skin)" />

      {/* Cheveux gris sur les côtés (calvitie sur le dessus) */}
      <path d="M21 40 C19 26 26 17 34 14 C29 20 25 28 24 40 Z" fill="#DADDE2" />
      <path d="M59 40 C61 26 54 17 46 14 C51 20 55 28 56 40 Z" fill="#DADDE2" />

      {/* Sourcils */}
      <path d="M30 27 q5 -2.5 9 0" fill="none" stroke="#C7CAD1" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M41 27 q5 -2.5 9 0" fill="none" stroke="#C7CAD1" strokeWidth="1.6" strokeLinecap="round" />
      {/* Yeux (clignent) */}
      <circle className="adm-alf-eye" cx="34" cy="32" r="2.1" fill="#3a2e26" />
      <circle className="adm-alf-eye" cx="46" cy="32" r="2.1" fill="#3a2e26" />
      {/* Nez */}
      <path d="M40 33 L38 40 q2 1.4 4 0" fill="none" stroke="#C08A5A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Moustache */}
      <path d="M30 44 Q40 50 50 44 Q45 47 40 46 Q35 47 30 44 Z" fill="#DADDE2" />
      {/* Sourire discret */}
      <path d="M35 49 Q40 52 45 49" fill="none" stroke="#B07A4A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
