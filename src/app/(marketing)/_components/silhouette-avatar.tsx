// Avatar « ombre de portrait » : fond orangé Trevys + silhouette de buste en
// ombre, avec une coiffure qui varie selon la personne (seed = slug).

const HAIR: React.ReactNode[] = [
  // 0 — cheveux courts
  <path key="0" d="M60 96 C60 64 82 52 100 52 C118 52 140 64 140 96 C132 80 118 74 100 74 C82 74 68 80 60 96 Z" />,
  // 1 — chignon
  <g key="1">
    <circle cx="100" cy="50" r="13" />
    <path d="M62 98 C62 66 84 56 100 56 C116 56 138 66 138 98 C130 82 116 76 100 76 C84 76 70 82 62 98 Z" />
  </g>,
  // 2 — cheveux longs
  <path key="2" d="M56 152 C50 110 58 68 100 62 C142 68 150 110 144 152 C142 120 130 96 118 92 C130 80 118 62 100 62 C82 62 70 80 82 92 C70 96 58 120 56 152 Z" />,
  // 3 — bouclés
  <path key="3" d="M60 92 a10 10 0 0 1 6 -20 a12 12 0 0 1 20 -10 a12 12 0 0 1 28 0 a12 12 0 0 1 20 10 a10 10 0 0 1 6 20 C132 78 118 72 100 72 C82 72 68 78 60 92 Z" />,
  // 4 — raie sur le côté
  <path key="4" d="M60 96 C58 64 82 52 100 52 C120 52 140 66 140 92 C132 78 120 74 106 74 C96 74 86 80 78 92 C72 88 66 90 62 98 Z" />,
  // 5 — dégradé court
  <path key="5" d="M64 92 C64 66 82 56 100 56 C118 56 136 66 136 92 C128 80 116 76 100 76 C84 76 72 80 64 92 Z" />,
  // 6 — coupe carrée
  <path key="6" d="M58 140 C56 96 76 60 100 60 C124 60 144 96 142 140 C138 108 128 90 116 88 C126 78 116 62 100 62 C84 62 74 78 84 88 C72 90 62 108 58 140 Z" />,
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
  const variant = h % HAIR.length;
  const id = `sil-${seed}`;
  const gid = `silg-${seed}`;

  return (
    <svg
      className={`mkt-team-photo mkt-sil ${className}`}
      viewBox="0 0 200 250"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label ? `${label} — portrait` : "Portrait"}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FBB040" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
        <radialGradient id={id} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="200" height="250" fill={`url(#${gid})`} />
      <rect width="200" height="250" fill={`url(#${id})`} />

      {/* Silhouette en ombre (une seule opacité de groupe pour un rendu net) */}
      <g fill="#2a1403" opacity="0.4">
        {HAIR[variant]}
        <rect x="88" y="150" width="24" height="46" rx="10" />
        <ellipse cx="100" cy="110" rx="40" ry="46" />
        <path d="M28 250 C28 202 60 188 100 188 C140 188 172 202 172 250 Z" />
      </g>
    </svg>
  );
}
