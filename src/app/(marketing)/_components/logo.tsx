// Logo Trevys : le mot « Trevys », partout (PC comme mobile).
// Volontairement sans image — aucun risque de logo cassé.
export function Logo({
  variant = "couleur",
}: {
  className?: string;
  variant?: "couleur" | "blanc";
  compactOnMobile?: boolean;
}) {
  return (
    <span className={`mkt-logo-lockup${variant === "blanc" ? " blanc" : ""}`}>
      <span className="mkt-logo-word">Trevys</span>
    </span>
  );
}
