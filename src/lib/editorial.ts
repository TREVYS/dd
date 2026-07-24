import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Calendrier éditorial : idées, brouillons d'articles (rédigés par l'IA),
// posts réseaux et newsletters à planifier. Stocké dans data/editorial.json.
const FILE = path.join(process.cwd(), "data", "editorial.json");

export type ItemType = "article" | "linkedin" | "instagram" | "newsletter" | "idee";
export type ItemStatus = "idee" | "brouillon" | "planifie" | "publie";

export type EditorialItem = {
  id: string;
  date: string; // AAAA-MM-JJ
  type: ItemType;
  title: string;
  status: ItemStatus;
  category?: string;
  excerpt?: string;
  image?: string; // image de couverture (URL médiathèque)
  body?: string; // contenu Markdown (brouillon d'article rédigé par l'IA)
  slug?: string; // renseigné une fois publié sur le site
  createdAt: string;
};

function readAll(): EditorialItem[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as EditorialItem[];
  } catch {
    return [];
  }
}

function writeAll(items: EditorialItem[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function listItems(): EditorialItem[] {
  return readAll().sort((a, b) => a.date.localeCompare(b.date));
}

export function getItem(id: string): EditorialItem | undefined {
  return readAll().find((i) => i.id === id);
}

export function addItem(input: Omit<EditorialItem, "id" | "createdAt">): EditorialItem {
  const items = readAll();
  const item: EditorialItem = {
    ...input,
    id: crypto.randomBytes(6).toString("hex"),
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  writeAll(items);
  return item;
}

export function updateItem(id: string, patch: Partial<EditorialItem>) {
  const items = readAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...patch };
  writeAll(items);
}

export function removeItem(id: string) {
  writeAll(readAll().filter((i) => i.id !== id));
}
