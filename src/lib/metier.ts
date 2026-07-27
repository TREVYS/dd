// Étiquette « métier » d'un article : rattache chaque contenu à l'une des deux
// activités du cabinet (conseil ou expertise comptable), à partir de sa catégorie.
export type Metier = "Consulting" | "Expertise comptable";

export function metierOf(category: string): Metier {
  const c = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/(innovation|transformation|conseil|consulting|strategie|organisation|\bia\b|intelligence)/.test(c)) {
    return "Consulting";
  }
  return "Expertise comptable";
}
