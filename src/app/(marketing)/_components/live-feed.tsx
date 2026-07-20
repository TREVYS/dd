"use client";

import { useEffect, useState } from "react";

// Petites notifications « activité du cabinet » qui défilent dans le hero.
const ITEMS = [
  { t: "+1 demande client", s: "il y a 2 min", c: "#12b76a" },
  { t: "Nouvelle mission consulting", s: "aujourd'hui", c: "#F5811F" },
  { t: "FEC analysé automatiquement", s: "il y a 5 min", c: "#7C3AED" },
  { t: "Rendez-vous confirmé", s: "à 14h30", c: "#12b76a" },
  { t: "Facture électronique émise", s: "à l'instant", c: "#F5811F" },
  { t: "Reporting mensuel livré", s: "hier", c: "#7C3AED" },
];

export function LiveFeed() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const it = ITEMS[i];

  return (
    <div className="mkt-live" aria-live="polite">
      <div className="mkt-live-card" key={i}>
        <span className="mkt-live-dot" style={{ background: it.c }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12l4 4 10-10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="mkt-live-txt">
          <strong>{it.t}</strong>
          <em>{it.s}</em>
        </span>
      </div>
    </div>
  );
}
