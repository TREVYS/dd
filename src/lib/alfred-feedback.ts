import fs from "node:fs";
import path from "node:path";

// Apprentissage des goûts de John : chaque pouce (haut/bas) donné sur une
// création d'Alfred (post, article, newsletter, visuel) est mémorisé, et les
// avis récents sont réinjectés dans les consignes d'Alfred pour qu'il apprenne.
// Stocké sur le disque de l'instance : data/alfred-feedback.json.
const FILE = path.join(process.cwd(), "data", "alfred-feedback.json");

export type FeedbackKind = "post" | "article" | "newsletter" | "visuel";

export type Feedback = {
  id: string; // identifiant de l'objet noté (post id, slug, campagne…)
  kind: FeedbackKind;
  verdict: "up" | "down";
  excerpt: string; // premières lignes du contenu noté (contexte pour Alfred)
  date: string;
};

function readAll(): Feedback[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Feedback[];
  } catch {
    return [];
  }
}

function writeAll(items: Feedback[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

// Un seul avis par objet : re-cliquer remplace (on peut changer d'avis).
export function addFeedback(input: Omit<Feedback, "date">) {
  const items = readAll().filter((f) => !(f.id === input.id && f.kind === input.kind));
  items.unshift({ ...input, excerpt: input.excerpt.slice(0, 220), date: new Date().toISOString() });
  writeAll(items.slice(0, 200));
}

export function getFeedback(id: string, kind: FeedbackKind): Feedback | undefined {
  return readAll().find((f) => f.id === id && f.kind === kind);
}

// Bloc de consignes : les avis récents, à injecter dans le système d'Alfred.
export function feedbackBlock(): string {
  const items = readAll().slice(0, 40);
  if (items.length === 0) return "";
  const fmt = (f: Feedback) => `- [${f.kind}] « ${f.excerpt.replace(/\s+/g, " ").trim()} »`;
  const ups = items.filter((f) => f.verdict === "up").slice(0, 15);
  const downs = items.filter((f) => f.verdict === "down").slice(0, 15);
  let out = "\n\n---\n\nGOÛTS DE JOHN (appris via ses pouces sur tes créations — adapte ton style en conséquence) :";
  if (ups.length) out += `\nCE QU'IL A AIMÉ (à reproduire) :\n${ups.map(fmt).join("\n")}`;
  if (downs.length) out += `\nCE QU'IL N'A PAS AIMÉ (à éviter) :\n${downs.map(fmt).join("\n")}`;
  return out;
}
