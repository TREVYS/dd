"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function send(payload: object) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true });
    }
  } catch {
    /* ignore */
  }
}

/** Collecte anonyme des vues et interactions clés (RDV, guide, newsletter). */
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    // Début de visite : on joint la provenance (referrer) une seule fois par
    // session — pour savoir d'où viennent les visiteurs, sans cookie.
    let nv = 0;
    let ref = "";
    try {
      if (!sessionStorage.getItem("trv-visit")) {
        sessionStorage.setItem("trv-visit", "1");
        nv = 1;
        ref = document.referrer || "";
      }
    } catch { /* stockage indisponible */ }
    send(nv ? { type: "view", path: pathname, nv, ref } : { type: "view", path: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest<HTMLElement>("a,button");
      if (!el) return;
      const explicit = el.getAttribute("data-track");
      if (explicit) return send({ type: "event", name: explicit });
      const href = el.getAttribute("href") ?? "";
      if (href.includes("/rendez-vous")) send({ type: "event", name: "clic_rendez_vous" });
      else if (href.includes("forms.cloud.microsoft")) send({ type: "event", name: "clic_guide_rfe" });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
