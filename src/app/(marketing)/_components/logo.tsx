"use client";

import { useState } from "react";

// Logo Trevys fiable : monogramme (logo.png importé) + mot « Trevys ».
// Ne dépend plus d'un gros SVG fragile. Si le monogramme ne charge pas, on
// garde le mot seul (jamais d'icône cassée).
// compactOnMobile : sur mobile, on n'affiche que le monogramme.
export function Logo({
  variant = "couleur",
  compactOnMobile = false,
}: {
  className?: string;
  variant?: "couleur" | "blanc";
  compactOnMobile?: boolean;
}) {
  const [badgeFail, setBadgeFail] = useState(false);

  return (
    <span className={`mkt-logo-lockup${variant === "blanc" ? " blanc" : ""}`}>
      {!badgeFail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mkt-logo-badge"
          src="/uploads/logo.png"
          alt="Trevys"
          onError={() => setBadgeFail(true)}
        />
      )}
      <span className={`mkt-logo-word${compactOnMobile ? " cm" : ""}`}>Trevys</span>
    </span>
  );
}
