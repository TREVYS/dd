import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Vidéos (YouTube) mises en avant dans les Ressources et gérées depuis le
// cockpit. Stockées sur le disque de l'instance : data/videos.json.
// Tant que le fichier n'existe pas, on sert la liste par défaut ci-dessous.
const FILE = path.join(process.cwd(), "data", "videos.json");

export type Video = {
  id: string;
  youtubeId: string;
  title: string;
  focus: string; // thème : Facturation électronique, IA, Innovation…
  date?: string; // AAAA-MM-JJ
  note?: string; // contexte (ex. « Relai LinkedIn Sage France »)
};

const DEFAULTS: Video[] = [
  {
    id: "seed-rfe",
    youtubeId: "1-l-g7ElQq8",
    title: "Facturation électronique : l'essentiel de la réforme",
    focus: "Facturation électronique",
    date: "2026-07-21",
    note: "Relai LinkedIn Sage France",
  },
  {
    id: "seed-ia",
    youtubeId: "Phqj4k817sA",
    title: "L'intelligence artificielle au service des dirigeants",
    focus: "Intelligence artificielle",
    date: "2026-08-04",
    note: "Relai LinkedIn Sage France",
  },
  {
    id: "seed-innovation",
    youtubeId: "QXKQXe3r-WY",
    title: "L'innovation, moteur du cabinet",
    focus: "Innovation",
    date: "2026-08-18",
    note: "Relai LinkedIn Sage France",
  },
];

// Extrait l'identifiant d'une vidéo YouTube depuis une URL ou un id brut.
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export function listVideos(): Video[] {
  try {
    if (!fs.existsSync(FILE)) return DEFAULTS;
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(data) ? data : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function write(videos: Video[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(videos, null, 2), "utf8");
}

export function addVideo(input: Omit<Video, "id">): Video {
  const videos = listVideos();
  const v: Video = { ...input, id: crypto.randomBytes(5).toString("hex") };
  write([...videos, v]);
  return v;
}

export function updateVideo(id: string, patch: Partial<Video>) {
  write(listVideos().map((v) => (v.id === id ? { ...v, ...patch } : v)));
}

export function removeVideo(id: string) {
  write(listVideos().filter((v) => v.id !== id));
}
