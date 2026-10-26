import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Vidéos (YouTube) mises en avant dans les Ressources et gérées depuis le
// cockpit, ou chargées automatiquement depuis la chaîne YouTube du cabinet.
// Stockées sur le disque de l'instance : data/videos.json.
const FILE = path.join(process.cwd(), "data", "videos.json");

export type Video = {
  id: string;
  youtubeId: string;
  title: string;
  focus: string; // thème : Facturation électronique, IA, Innovation…
  date?: string; // AAAA-MM-JJ
  note?: string; // contexte (ex. « Relai LinkedIn Sage France »)
  description?: string; // description YouTube (vidéos synchronisées)
  source?: "manual" | "youtube"; // ajoutée à la main, ou récupérée automatiquement
};

// Où le bloc vidéo s'affiche dans Ressources, par rapport à la liste
// d'articles — réglage simple, pas de glisser-déposer nécessaire ici.
export type VideosPlacement = "top" | "bottom" | "hidden";

type Store = { placement: VideosPlacement; items: Video[] };

const DEFAULTS: Video[] = [
  {
    id: "seed-rfe",
    youtubeId: "1-l-g7ElQq8",
    title: "Facturation électronique : l'essentiel de la réforme",
    focus: "Facturation électronique",
    date: "2026-07-21",
    note: "Relai LinkedIn Sage France",
    source: "manual",
  },
  {
    id: "seed-ia",
    youtubeId: "Phqj4k817sA",
    title: "L'intelligence artificielle au service des dirigeants",
    focus: "Intelligence artificielle",
    date: "2026-08-04",
    note: "Relai LinkedIn Sage France",
    source: "manual",
  },
  {
    id: "seed-innovation",
    youtubeId: "QXKQXe3r-WY",
    title: "L'innovation, moteur du cabinet",
    focus: "Innovation",
    date: "2026-08-18",
    note: "Relai LinkedIn Sage France",
    source: "manual",
  },
];

// Extrait l'identifiant d'une vidéo YouTube depuis une URL ou un id brut.
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return { placement: "top", items: DEFAULTS };
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    // Compatibilité : l'ancien format stockait un simple tableau.
    if (Array.isArray(data)) return { placement: "top", items: data };
    return { placement: data.placement ?? "top", items: Array.isArray(data.items) ? data.items : DEFAULTS };
  } catch {
    return { placement: "top", items: DEFAULTS };
  }
}

function write(store: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function listVideos(): Video[] {
  return read().items;
}

export function getVideosPlacement(): VideosPlacement {
  return read().placement;
}

export function setVideosPlacement(placement: VideosPlacement) {
  write({ ...read(), placement });
}

export function addVideo(input: Omit<Video, "id">): Video {
  const store = read();
  const v: Video = { ...input, id: crypto.randomBytes(5).toString("hex") };
  write({ ...store, items: [...store.items, v] });
  return v;
}

export function updateVideo(id: string, patch: Partial<Video>) {
  const store = read();
  write({ ...store, items: store.items.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
}

export function removeVideo(id: string) {
  const store = read();
  write({ ...store, items: store.items.filter((v) => v.id !== id) });
}

export function hasYoutubeId(youtubeId: string): boolean {
  return read().items.some((v) => v.youtubeId === youtubeId);
}

// Réordonne les vidéos selon la liste d'ids fournie (ordre d'affichage sur
// le site). Les vidéos absentes de la liste (ex. ajoutées entre-temps)
// sont conservées à la fin, dans leur ordre actuel.
export function reorderVideos(orderedIds: string[]) {
  const store = read();
  const byId = new Map(store.items.map((v) => [v.id, v]));
  const ordered = orderedIds.map((id) => byId.get(id)).filter((v): v is Video => !!v);
  const rest = store.items.filter((v) => !orderedIds.includes(v.id));
  write({ ...store, items: [...ordered, ...rest] });
}
