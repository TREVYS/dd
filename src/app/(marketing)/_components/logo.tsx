"use client";

import { useState } from "react";
import { BrandMark } from "./brand";

// Logo officiel Trevys hébergé sur le WordPress du cabinet.
const WP_LOGO =
  "https://www.trevys-advisory.fr/wp-content/uploads/2023/05/logo.svg";

/**
 * Affiche le vrai logo Trevys (SVG WordPress). En cas d'échec de chargement,
 * repli automatique sur la version vectorielle intégrée (BrandMark).
 */
export function Logo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <BrandMark className={className} />;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className={className}
      src={WP_LOGO}
      alt="Trevys — Expertise comptable & conseil"
      onError={() => setFailed(true)}
    />
  );
}
