"use client";

import { useState } from "react";

// Logo Trevys de la barre de navigation :
// - PC : le logo complet du cabinet (/uploads/1.png) ;
// - Mobile (compactOnMobile) : le badge TS (/uploads/logo.png) ;
// - Si une image ne charge pas : repli sur le mot « Trevys » (jamais d'icône cassée).
export function Logo({
  variant = "couleur",
  compactOnMobile = false,
}: {
  className?: string;
  variant?: "couleur" | "blanc";
  compactOnMobile?: boolean;
}) {
  const [fullFail, setFullFail] = useState(false);
  const [badgeFail, setBadgeFail] = useState(false);

  return (
    <span className={`mkt-logo-lockup${variant === "blanc" ? " blanc" : ""}`}>
      {/* Logo complet — PC */}
      {compactOnMobile && !fullFail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mkt-logo-full-img"
          src="/uploads/1.png"
          alt="Trevys"
          onError={() => setFullFail(true)}
        />
      )}
      {/* Badge TS — mobile */}
      {compactOnMobile && !badgeFail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mkt-logo-badge"
          src="/uploads/logo.png"
          alt="Trevys"
          onError={() => setBadgeFail(true)}
        />
      )}
      {/* Mot « Trevys » : hors nav, ou repli si les images manquent */}
      <span
        className={`mkt-logo-word${compactOnMobile ? " cm" : ""}${compactOnMobile && !fullFail ? " has-img" : ""}`}
      >
        Trevys
      </span>
    </span>
  );
}
