"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Bandeau de consentement cookies (RGPD / CNIL).
// Google Analytics n'est chargé qu'après un consentement explicite :
// aucun cookie de mesure d'audience n'est déposé avant.
// Le choix est mémorisé 6 mois (recommandation CNIL) dans localStorage.

const STORAGE_KEY = "trevys-consent";
const SIX_MONTHS_MS = 182 * 24 * 60 * 60 * 1000;

type Stored = { choice: "granted" | "denied"; at: number };

function readChoice(): Stored["choice"] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (!s.at || Date.now() - s.at > SIX_MONTHS_MS) return null;
    return s.choice === "granted" || s.choice === "denied" ? s.choice : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Stored["choice"]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }));
  } catch {}
}

function loadGa(gaId: string) {
  if (document.getElementById("ga-gtag")) return;
  const s = document.createElement("script");
  s.id = "ga-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(s);
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // gtag.js exige l'objet `arguments` (pas un tableau), sinon les commandes
  // sont ignorées et aucune donnée ne part.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", gaId, { anonymize_ip: true });
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  // null = pas encore lu (SSR), "pending" = pas de choix mémorisé → bandeau.
  const [state, setState] = useState<"pending" | "granted" | "denied" | null>(null);

  useEffect(() => {
    const choice = readChoice();
    setState(choice ?? "pending");
    if (choice === "granted" && gaId) loadGa(gaId);
  }, [gaId]);

  // Sans identifiant GA, seuls des cookies techniques existent : pas de bandeau.
  if (!gaId || state !== "pending") return null;

  const decide = (choice: Stored["choice"]) => {
    saveChoice(choice);
    setState(choice);
    if (choice === "granted") loadGa(gaId);
  };

  return (
    <div className="mkt-consent" role="dialog" aria-live="polite" aria-label="Gestion des cookies">
      <p>
        Nous utilisons des cookies de mesure d&apos;audience (Google Analytics)
        pour améliorer ce site. Vous pouvez accepter ou refuser — le site
        fonctionne parfaitement dans les deux cas.{" "}
        <Link href="/politique-de-confidentialite">En savoir plus</Link>
      </p>
      <div className="mkt-consent-btns">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => decide("denied")}>
          Refuser
        </button>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => decide("granted")}>
          Accepter
        </button>
      </div>
    </div>
  );
}
