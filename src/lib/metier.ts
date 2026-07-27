// Étiquette « métier » d'un article, déduite de sa catégorie : Consulting,
// Expertise comptable, ou Transverse (actualité générale, sujets communs).
export type Metier = "Consulting" | "Expertise comptable" | "Transverse";

export const METIERS: Metier[] = ["Consulting", "Expertise comptable", "Transverse"];

// Métier effectif d'un article : l'étiquette choisie à la main dans l'éditeur
// prime ; sinon elle est déduite de la catégorie.
export function articleMetier(meta: { category: string; metier?: string }): Metier {
  const m = (meta.metier ?? "").trim().toLowerCase();
  const found = METIERS.find((x) => x.toLowerCase() === m);
  return found ?? metierOf(meta.category);
}

export function metierOf(category: string): Metier {
  const c = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/(innovation|transformation|conseil|consulting|strategie|organisation|\bia\b|intelligence)/.test(c)) {
    return "Consulting";
  }
  if (/(facturation|fiscal|compta|norme|tva|paie|social|audit|bilan|declaration)/.test(c)) {
    return "Expertise comptable";
  }
  return "Transverse";
}
