"use client";

import { useEffect, useRef, useState } from "react";

// Aperçu d'e-mail à l'échelle : le gabarit fait 600 px de large — sur mobile,
// on le réduit proportionnellement pour le voir en entier, sans zoom ni
// défilement horizontal.
const EMAIL_WIDTH = 640;
const BASE_HEIGHT = 760;

export function EmailPreview({ html }: { html: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / EMAIL_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", overflow: "hidden", borderRadius: 12, border: "1px solid var(--line)" }}>
      <iframe
        title="Aperçu de l'e-mail"
        sandbox=""
        srcDoc={html}
        style={{
          width: EMAIL_WIDTH,
          height: BASE_HEIGHT,
          border: 0,
          background: "#fff",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "block",
        }}
      />
      {/* Compense la hauteur retirée par la mise à l'échelle */}
      <div style={{ marginTop: -(BASE_HEIGHT * (1 - scale)) }} />
    </div>
  );
}
