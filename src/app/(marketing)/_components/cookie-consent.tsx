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

function loadGtag(gaId?: string, adsId?: string) {
  // Un seul chargement du script gtag.js suffit ; on y attache ensuite
  // autant de configurations (GA4, Google Ads…) que nécessaire.
  const loaderId = gaId ?? adsId;
  if (!loaderId || document.getElementById("ga-gtag")) return;
  const s = document.createElement("script");
  s.id = "ga-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${loaderId}`;
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
  if (gaId) gtag("config", gaId, { anonymize_ip: true });
  // Google Ads : pas de config supplémentaire nécessaire ici — l'événement
  // de conversion (clic « Prendre rendez-vous ») est envoyé par analytics-beacon.
  if (adsId) gtag("config", adsId);
}

export function CookieConsent({ gaId, adsId }: { gaId?: string; adsId?: string }) {
  // null = pas encore lu (SSR), "pending" = pas de choix mémorisé → bandeau.
  const [state, setState] = useState<"pending" | "granted" | "denied" | null>(null);

  useEffect(() => {
    const choice = readChoice();
    setState(choice ?? "pending");
    if (choice === "granted") loadGtag(gaId, adsId);
  }, [gaId, adsId]);

  // Sans identifiant GA ni Ads, seuls des cookies techniques existent : pas de bandeau.
  if ((!gaId && !adsId) || state !== "pending") return null;

  const decide = (choice: Stored["choice"]) => {
    saveChoice(choice);
    setState(choice);
    if (choice === "granted") loadGtag(gaId, adsId);
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
