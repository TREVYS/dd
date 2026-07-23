"use client";

import { useState } from "react";

// Logo Trevys résilient : si l'image ne se charge pas (certains navigateurs
// mobiles), on retombe proprement sur le mot « Trevys » en toutes lettres.
// compactOnMobile : monogramme « TS » sur mobile, logo complet sur desktop.
export function Logo({
  className,
  variant = "couleur",
  compactOnMobile = false,
}: {
  className?: string;
  variant?: "couleur" | "blanc";
  compactOnMobile?: boolean;
}) {
  const [failFull, setFailFull] = useState(false);
  const [failMark, setFailMark] = useState(false);
  const src =
    variant === "blanc" ? "/brand/trevys-logo-blanc.svg" : "/brand/trevys-logo.svg";
  const alt = "Trevys — Expertise comptable & conseil";

  if (!compactOnMobile) {
    if (failFull) {
      return <span className={`mkt-logo-fallback${variant === "blanc" ? " blanc" : ""}`}>Trevys</span>;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={src} alt={alt} onError={() => setFailFull(true)} />;
  }

  return (
    <span className="mkt-logo-wrap">
      {failFull ? (
        <span className="mkt-logo-full mkt-logo-fallback">Trevys</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={`mkt-logo-full ${className ?? ""}`} src={src} alt={alt} onError={() => setFailFull(true)} />
      )}
      {failMark ? (
        <span className="mkt-logo-mark mkt-logo-fallback">Trevys</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="mkt-logo-mark" src="/uploads/logo.png" alt="Trevys" onError={() => setFailMark(true)} />
      )}
    </span>
  );
}
