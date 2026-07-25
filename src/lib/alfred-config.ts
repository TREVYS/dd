import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// « Éducation » d'Alfred, le directeur de communication IA du cabinet.
// Ligne éditoriale, ton, messages clés, mots à éviter, et exemples de
// publications passées dont il s'inspire pour écrire dans votre style.
const FILE = path.join(process.cwd(), "data", "alfred.json");

export type AlfredExample = { id: string; label: string; content: string };
export type AlfredDoc = { id: string; title: string; source: string; text: string; addedAt: string; theme?: string };

// Thèmes de rangement de la GED — aident Alfred à cibler la bonne
// documentation selon le sujet traité.
export const GED_THEMES = [
  "Facturation électronique",
  "Fiscalité",
  "Comptabilité",
  "IA & innovation",
  "Cabinet & interne",
  "Communication",
  "Autre",
] as const;

export type AlfredConfig = {
  ton: string;
  ligneEditoriale: string;
  messagesCles: string;
  motsInterdits: string;
  signature: string;
  exemples: AlfredExample[];
  knowledge: AlfredDoc[];
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
  knowledge: [],
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

export function addKnowledge(title: string, source: string, text: string): AlfredDoc {
  const cfg = readAlfred();
  const doc: AlfredDoc = {
    id: crypto.randomBytes(5).toString("hex"),
    title: title || source || "Document",
    source,
    text,
    addedAt: new Date().toISOString(),
  };
  cfg.knowledge = [...(cfg.knowledge ?? []), doc];
  write(cfg);
  return doc;
}

export function setKnowledgeTheme(id: string, theme: string) {
  const cfg = readAlfred();
  cfg.knowledge = (cfg.knowledge ?? []).map((d) => (d.id === id ? { ...d, theme: theme || undefined } : d));
  write(cfg);
}

export function removeKnowledge(id: string) {
  const cfg = readAlfred();
  cfg.knowledge = (cfg.knowledge ?? []).filter((d) => d.id !== id);
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

  // Base de connaissance : on borne la taille totale injectée dans le prompt.
  const docs = c.knowledge ?? [];
  let budget = 24_000;
  const knowledge = docs.length
    ? docs
        .map((d) => {
          const slice = d.text.slice(0, Math.max(0, budget));
          budget -= slice.length;
          return slice ? `### ${d.title}${d.theme ? ` [thème : ${d.theme}]` : ""} (source : ${d.source})\n${slice}` : "";
        })
        .filter(Boolean)
        .join("\n\n")
    : "";

  const knowledgeBlock = knowledge
    ? `\n\nBASE DE CONNAISSANCE (documents fournis par le cabinet, rangés par thème — pour un article ou un post, appuie-toi EN PRIORITÉ sur les documents dont le thème correspond au sujet ; ils font foi pour les faits, la terminologie et les positions officielles) :\n${knowledge}`
    : "";

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
${ex}${knowledgeBlock}`;
}
