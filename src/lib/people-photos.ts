import fs from "node:fs";
import path from "node:path";

// Photos des personnes (associés & consultants) modifiables depuis le cockpit
// et par Alfred : surcharges stockées dans data/people-photos.json sous la
// forme { "<slug>": "/uploads/….jpg" }. Sans surcharge, la photo par défaut
// du code s'applique.
const FILE = path.join(process.cwd(), "data", "people-photos.json");

type Store = Record<string, string>;

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function getPeoplePhoto(slug: string): string | undefined {
  return read()[slug];
}

export function listPeoplePhotos(): Store {
  return read();
}

export function setPeoplePhoto(slug: string, url: string) {
  const store = read();
  store[slug] = url;
  write(store);
}

export function removePeoplePhoto(slug: string) {
  const store = read();
  delete store[slug];
  write(store);
}
