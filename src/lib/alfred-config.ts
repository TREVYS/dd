import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// « Éducation » d'Alfred, le directeur de communication IA du cabinet.
// Ligne éditoriale, ton, messages clés, mots à éviter, et exemples de
// publications passées dont il s'inspire pour écrire dans votre style.
const FILE = path.join(process.cwd(), "data", "alfred.json");

export type AlfredExample = { id: string; label: string; content: string };

export type AlfredConfig = {
  ton: string;
  ligneEditoriale: string;
  messagesCles: string;
  motsInterdits: string;
  signature: string;
  exemples: AlfredExample[];
};

const DEFAULTS: AlfredConfig = {
  ton: "Professionnel, clair et chaleureux. Pédagogue sans être condescendant. On s'adresse à des dirigeants, DAF et chefs d'entreprise.",
  ligneEditoriale:
    "Trevys est un cabinet d'expertise comptable et de conseil augmenté par la technologie. On valorise la proximité, la maîtrise du métier et l'innovation utile. On décrypte l'actualité (fiscalité, comptabilité, facturation électronique, IA) pour la rendre actionnable.",
  messagesCles:
    "- La connaissance intime du client fait la différence.\n- La technologie au service de l'humain, pas l'inverse.\n- Anticiper vaut mieux que subir (ex. réforme facturation électronique).",
  motsInterdits:
    "optimisation fiscale (dire plutôt « fiscalité maîtrisée » / « juste imposition »)",
  signature: "Trevys — Cabinet d'expertise comptable & de conseil",
  exemples: [],
};

export function readAlfred(): AlfredConfig {
  try {
    if (!fs.existsSync(FILE)) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return DEFAULTS;
  }
}

function write(cfg: AlfredConfig) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cfg, null, 2), "utf8");
}

export function saveAlfred(patch: Partial<AlfredConfig>) {
  write({ ...readAlfred(), ...patch });
}

export function addExample(label: string, content: string) {
  const cfg = readAlfred();
  cfg.exemples.push({ id: crypto.randomBytes(5).toString("hex"), label, content });
  write(cfg);
}

export function removeExample(id: string) {
  const cfg = readAlfred();
  cfg.exemples = cfg.exemples.filter((e) => e.id !== id);
  write(cfg);
}

// Compose la partie « personnalité + savoir » du prompt système d'Alfred.
export function alfredSystemBlock(): string {
  const c = readAlfred();
  const ex = c.exemples.length
    ? c.exemples
        .map((e, i) => `Exemple ${i + 1}${e.label ? ` (${e.label})` : ""} :\n${e.content}`)
        .join("\n\n")
    : "(aucun exemple fourni pour l'instant)";
  return `Tu t'appelles **Alfred**, le directeur de communication du cabinet Trevys. Tu es fin, cultivé, fiable et bienveillant — un véritable bras droit éditorial, à la manière d'un journaliste chevronné.

TON :
${c.ton}

LIGNE ÉDITORIALE :
${c.ligneEditoriale}

MESSAGES CLÉS À FAIRE PASSER :
${c.messagesCles}

MOTS / TOURNURES À ÉVITER :
${c.motsInterdits}

SIGNATURE :
${c.signature}

EXEMPLES DE PUBLICATIONS PASSÉES (inspire-toi de ce style, sans les copier) :
${ex}`;
}
