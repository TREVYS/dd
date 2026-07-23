"use client";

import { useState } from "react";

// Affiche le logo d'une société en essayant plusieurs sources successives ;
// si aucune ne charge, on retombe proprement sur le nom en toutes lettres.
export function RefLogo({ name, srcs }: { name: string; srcs: string[] }) {
  const [i, setI] = useState(0);

  if (i >= srcs.length) {
    return <span className="mkt-ref-name">{name}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="mkt-ref-img"
      src={srcs[i]}
      alt={name}
      loading="lazy"
      onError={() => setI((v) => v + 1)}
    />
  );
}
