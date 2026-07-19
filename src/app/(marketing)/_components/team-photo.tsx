"use client";

import { useState } from "react";

/**
 * Photo d'un membre de l'équipe, avec repli automatique sur les initiales
 * si le fichier n'existe pas encore dans public/brand/team/.
 */
export function TeamPhoto({
  src,
  initials,
  alt,
}: {
  src: string;
  initials: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="mkt-team-photo mkt-team-fallback" aria-hidden="true">
        {initials}
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className="mkt-team-photo"
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
