import fs from "node:fs";
import path from "node:path";

// Studio Instagram : maquettes de fond + goûts visuels du cabinet, définis
// dans Réglages. Alfred s'en sert pour générer les visuels des posts.
// Stocké sur le disque de l'instance : data/ig-studio.json.
const FILE = path.join(process.cwd(), "data", "ig-studio.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type IgStudio = {
  style: string; // notes libres : « ce que j'aime » (couleurs, ton, à éviter…)
  templates: string[]; // URLs /uploads/… des maquettes de fond
  lastTemplate?: number; // rotation : index de la dernière maquette utilisée
};

export function getStudio(): IgStudio {
  try {
    if (!fs.existsSync(FILE)) return { style: "", templates: [] };
    const d = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return {
      style: String(d.style ?? ""),
      templates: Array.isArray(d.templates) ? d.templates.map(String) : [],
      lastTemplate: typeof d.lastTemplate === "number" ? d.lastTemplate : undefined,
    };
  } catch {
    return { style: "", templates: [] };
  }
}

export function saveStudio(patch: Partial<IgStudio>) {
  const cur = getStudio();
  const next = { ...cur, ...patch };
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
}
