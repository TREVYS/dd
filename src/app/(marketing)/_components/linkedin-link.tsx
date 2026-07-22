// Lien LinkedIn réutilisable (icône + libellé optionnel).
export function LinkedinLink({
  href,
  name,
  className = "",
  compact = false,
}: {
  href: string;
  name: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${name} sur LinkedIn`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16">
        <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z" />
      </svg>
      {!compact && <span>LinkedIn</span>}
    </a>
  );
}
