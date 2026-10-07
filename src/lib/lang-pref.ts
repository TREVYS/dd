// Préférence de langue du visiteur, partagée entre le bouton EN/FR de la nav
// (traduction Google à la volée) et la bascule FR/EN propre à chaque article
// (vraies traductions rédigées par Alfred). Même cookie pour les deux : une
// fois le visiteur passé en anglais, il y reste d'une page à l'autre.
export const LANG_COOKIE = "googtrans";

export function getLangPref(): "en" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/googtrans=\/fr\/(en)/);
  return m ? "en" : null;
}

export function setLangPref(lang: "en" | null) {
  if (typeof document === "undefined") return;
  const value = lang ? `/fr/${lang}` : "";
  document.cookie = `${LANG_COOKIE}=${value};path=/`;
  document.cookie = `${LANG_COOKIE}=${value};path=/;domain=.${window.location.hostname}`;
}
