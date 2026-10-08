"use client";

import { useEffect, useRef, useState } from "react";
import { getLangPref, setLangPref } from "@/lib/lang-pref";

// Bouton de traduction à la volée (anglais / français), pour le confort des
// visiteurs étrangers. S'appuie sur le widget Google Website Translator,
// piloté en coulisses : pas de bandeau Google visible, juste notre bouton.
// NB : traduction automatique, pas une vraie page /en optimisée SEO —
// les articles traduits par Alfred (vraies pages /en/blog/<slug>) prennent
// le relais automatiquement quand ils existent (voir ArticleLangRedirect).
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: Record<string, unknown>, id: string) => void } };
  }
}

const SCRIPT_ID = "google-translate-script";

function loadWidget(onReady: () => void) {
  if (document.getElementById(SCRIPT_ID)) {
    // Déjà en cours de chargement ou chargé sur une page précédente.
    if (window.google?.translate) onReady();
    else window.googleTranslateElementInit = onReady;
    return;
  }

  let el = document.getElementById("google_translate_element");
  if (!el) {
    el = document.createElement("div");
    el.id = "google_translate_element";
    document.body.appendChild(el);
  }

  window.googleTranslateElementInit = () => {
    if (window.google?.translate) {
      new window.google.translate.TranslateElement(
        { pageLanguage: "fr", includedLanguages: "en", autoDisplay: false },
        "google_translate_element",
      );
    }
    onReady();
  };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

// Pilote directement le menu déroulant que Google insère dans la page :
// plus fiable que de compter sur la relecture automatique du cookie au
// rechargement (qui échoue souvent en silence).
function applyGoogleTranslate(lang: "en" | "fr") {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
    return true;
  }
  return false;
}

export function LangToggle() {
  const [lang, setLangState] = useState<"en" | null>(null);
  const [ready, setReady] = useState(false);
  const pending = useRef<"en" | "fr" | null>(null);

  useEffect(() => {
    setLangState(getLangPref());
    loadWidget(() => {
      setReady(true);
      // Si l'utilisateur a cliqué pendant le chargement du widget, ou si
      // une préférence anglaise était déjà mémorisée (navigation d'une page
      // à l'autre), on applique dès que le menu Google existe.
      const want = pending.current ?? getLangPref() ?? "fr";
      const tryApply = () => {
        if (!applyGoogleTranslate(want) && want === "en") setTimeout(tryApply, 150);
      };
      if (want === "en") tryApply();
    });
  }, []);

  const toggle = () => {
    const next: "en" | "fr" = lang === "en" ? "fr" : "en";
    setLangPref(next === "en" ? "en" : null);
    setLangState(next === "en" ? "en" : null);
    pending.current = next;
    if (!applyGoogleTranslate(next) || !ready) {
      // Widget pas encore prêt : il appliquera la préférence mémorisée dès
      // son chargement (voir loadWidget ci-dessus). Repli : rechargement.
      setTimeout(() => {
        if (!applyGoogleTranslate(next)) window.location.reload();
      }, 400);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost mkt-lang-toggle"
      aria-label={lang === "en" ? "Switch to French" : "Passer en anglais"}
      onClick={toggle}
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
