// Étiquette « métier » d'un article, déduite de sa catégorie : Consulting,
// Expertise comptable, ou Transverse (actualité générale, sujets communs).
export type Metier = "Consulting" | "Expertise comptable" | "Transverse";

export const METIERS: Metier[] = ["Consulting", "Expertise comptable", "Transverse"];

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
