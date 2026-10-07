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

function setLang(lang: "en" | null) {
  setLangPref(lang);
  window.location.reload();
}

export function LangToggle() {
  const [lang, setLangState] = useState<"en" | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    setLangState(getLangPref());
    if (loaded.current) return;
    loaded.current = true;

    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.display = "none";
    document.body.appendChild(el);

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "fr", includedLanguages: "en", autoDisplay: false },
          "google_translate_element",
        );
      }
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost mkt-lang-toggle"
      aria-label={lang === "en" ? "Switch to French" : "Passer en anglais"}
      onClick={() => setLang(lang === "en" ? null : "en")}
    >
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
}
