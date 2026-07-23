"use client";

import { useState } from "react";

// Logo Trevys :
// - PC : uniquement le mot « Trevys » (jamais le badge TS).
// - Mobile (≤600px), quand compactOnMobile est actif (barre de navigation) :
//   uniquement le badge TS. Si l'image ne charge pas, le mot reprend sa place.
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
      {compactOnMobile && !badgeFail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mkt-logo-badge"
          src="/uploads/logo.png"
          alt="Trevys"
          onError={() => setBadgeFail(true)}
        />
      )}
      <span className={`mkt-logo-word${compactOnMobile && !badgeFail ? " cm" : ""}`}>
        Trevys
      </span>
    </span>
  );
}
