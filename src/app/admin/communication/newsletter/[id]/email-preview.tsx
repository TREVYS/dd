"use client";

import { useEffect, useRef, useState } from "react";

// Aperçu d'e-mail à l'échelle : le gabarit fait 600 px de large — sur mobile,
// on le réduit proportionnellement pour le voir en entier, sans zoom ni
// défilement horizontal.
const EMAIL_WIDTH = 640;
const BASE_HEIGHT = 760;

export function EmailPreview({ html: initialHtml, live = false }: { html: string; live?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [html, setHtml] = useState(initialHtml);

  // Aperçu vivant : on écoute la frappe dans l'éditeur (champ « body ») de la
  // page et on régénère le rendu e-mail après une courte pause.
  useEffect(() => {
    if (!live) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onInput = (e: Event) => {
      const el = e.target as HTMLTextAreaElement | null;
      if (!el || el.name !== "body") return;
      const value = el.value;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const r = await fetch("/api/admin/comms/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: value }),
          });
          const d = (await r.json()) as { html?: string };
          if (d.html) setHtml(d.html);
        } catch { /* on garde l'aperçu précédent */ }
      }, 500);
    };
    document.addEventListener("input", onInput, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("input", onInput, true);
    };
  }, [live]);

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
