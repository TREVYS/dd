// Avatar consultant stylisé : bandeau orangé Trevys + médaillon givré avec une
// silhouette de buste, coiffure variant selon la personne (seed = slug).

const HAIR: Record<number, React.ReactNode> = {
  0: <path d="M101 68 C101 49 110 42 120 42 C130 42 139 49 139 68 C133 56 128 52 120 52 C112 52 107 56 101 68 Z" />, // court
  1: ( // chignon
    <g>
      <circle cx="120" cy="40" r="8" />
      <path d="M103 68 C103 50 111 44 120 44 C129 44 137 50 137 68 C132 57 128 54 120 54 C112 54 108 57 103 68 Z" />
    </g>
  ),
  2: <path d="M98 118 C92 82 100 50 120 46 C140 50 148 82 142 118 C140 92 132 70 122 66 C131 58 120 48 120 48 C120 48 109 58 118 66 C108 70 100 92 98 118 Z" />, // longs
  3: <path d="M100 66 a8 8 0 0 1 5 -16 a10 10 0 0 1 16 -8 a10 10 0 0 1 16 8 a8 8 0 0 1 5 16 C134 55 128 51 120 51 C112 51 106 55 100 66 Z" />, // bouclés
  4: <path d="M101 68 C100 49 111 42 120 42 C131 42 140 50 139 66 C133 56 129 53 122 53 C114 53 107 58 102 67 Z" />, // raie côté
  5: <path d="M99 102 C97 70 108 48 120 48 C132 48 143 70 141 102 C138 80 131 66 122 64 C130 57 120 50 120 50 C120 50 110 57 118 64 C109 66 102 80 99 102 Z" />, // carré
};

const PALETTES = [
  ["#FBB040", "#C2410C"],
  ["#F6A623", "#B5340B"],
  ["#FBB040", "#E2600F"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function SilhouetteAvatar({
  seed,
  label,
  className = "",
}: {
  seed: string;
  label?: string;
  className?: string;
}) {
  const h = hash(seed);
  const variant = h % Object.keys(HAIR).length;
  const [c0, c1] = PALETTES[h % PALETTES.length];
  const gid = `slg-${seed}`;
  const cid = `slc-${seed}`;

  return (
    <svg
      className={`mkt-team-photo mkt-sil ${className}`}
      viewBox="0 0 240 160"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label ? `${label} — portrait` : "Portrait"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={c0} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
        <clipPath id={cid}>
          <circle cx="120" cy="80" r="52" />
        </clipPath>
      </defs>

      <rect width="240" height="160" fill={`url(#${gid})`} />

      {/* Décor discret */}
      <circle cx="212" cy="26" r="34" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
      <circle cx="28" cy="142" r="26" fill="none" stroke="#fff" strokeOpacity="0.1" strokeWidth="2" />

      {/* Médaillon givré */}
      <circle cx="120" cy="80" r="52" fill="#fff" fillOpacity="0.16" />
      <circle cx="120" cy="80" r="52" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />

      {/* Silhouette (buste + coiffure), en clair, découpée dans le médaillon */}
      <g clipPath={`url(#${cid})`} fill="#fff" fillOpacity="0.92">
        {HAIR[variant]}
        <rect x="112" y="90" width="16" height="20" rx="6" />
        <ellipse cx="120" cy="72" rx="22" ry="24" />
        <path d="M70 160 C70 124 92 112 120 112 C148 112 170 124 170 160 Z" />
      </g>
    </svg>
  );
}
