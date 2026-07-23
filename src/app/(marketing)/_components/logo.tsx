// Vrai logo Trevys (pack vectoriel officiel), servi depuis /public/brand.
// variant "blanc" pour les fonds sombres (pied de page).
// compactOnMobile : affiche le monogramme « TS » sur mobile, le logo complet sur desktop.
export function Logo({
  className,
  variant = "couleur",
  compactOnMobile = false,
}: {
  className?: string;
  variant?: "couleur" | "blanc";
  compactOnMobile?: boolean;
}) {
  const src =
    variant === "blanc" ? "/brand/trevys-logo-blanc.svg" : "/brand/trevys-logo.svg";

  if (!compactOnMobile) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt="Trevys — Expertise comptable & conseil" />;
  }

  return (
    <span className="mkt-logo-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`mkt-logo-full ${className ?? ""}`} src={src} alt="Trevys — Expertise comptable & conseil" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="mkt-logo-mark" src="/uploads/logo.png" alt="Trevys" />
    </span>
  );
}
