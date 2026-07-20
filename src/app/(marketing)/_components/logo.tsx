// Vrai logo Trevys (pack vectoriel officiel), servi depuis /public/brand.
// variant "blanc" pour les fonds sombres (pied de page).
export function Logo({
  className,
  variant = "couleur",
}: {
  className?: string;
  variant?: "couleur" | "blanc";
}) {
  const src =
    variant === "blanc" ? "/brand/trevys-logo-blanc.svg" : "/brand/trevys-logo.svg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt="Trevys — Expertise comptable & conseil" />
  );
}
