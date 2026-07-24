import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Routines d'Alfred : tâches récurrentes (ex. rédiger un article chaque
// semaine, en brouillon, pour validation). Stockées dans data/alfred-routines.json.
const FILE = path.join(process.cwd(), "data", "alfred-routines.json");

export type RoutineType = "article" | "linkedin" | "instagram" | "newsletter";
export type RoutineFreq = "quotidienne" | "hebdomadaire" | "mensuelle";

export type Routine = {
  id: string;
  label: string; // nom lisible (ex. « Article hebdo facturation électronique »)
  type: RoutineType;
  freq: RoutineFreq;
  weekday?: number; // 0=dimanche … 6=samedi (hebdomadaire)
  monthday?: number; // 1-28 (mensuelle)
  topic: string; // consigne donnée à Alfred (sujet, angle, thème)
  enabled: boolean;
  createdAt: string; // ISO
  lastRun?: string; // ISO
  lastResult?: string; // résumé de la dernière exécution
};

function readAll(): Routine[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Routine[];
  } catch {
    return [];
  }
}

function writeAll(items: Routine[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function listRoutines(): Routine[] {
  return readAll();
}

export function getRoutine(id: string): Routine | undefined {
  return readAll().find((r) => r.id === id);
}

export function addRoutine(input: Omit<Routine, "id" | "createdAt">): Routine {
  const items = readAll();
  const r: Routine = { ...input, id: crypto.randomBytes(5).toString("hex"), createdAt: new Date().toISOString() };
  items.push(r);
  writeAll(items);
  return r;
}

export function updateRoutine(id: string, patch: Partial<Routine>) {
  writeAll(readAll().map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function removeRoutine(id: string) {
  writeAll(readAll().filter((r) => r.id !== id));
}

// ---- Échéances ------------------------------------------------------------

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Prochaine échéance après la dernière exécution (ou la création).
export function nextDue(r: Routine): Date {
  const base = new Date(r.lastRun ?? r.createdAt);
  const next = new Date(base);
  next.setHours(6, 0, 0, 0);
  if (r.freq === "quotidienne") {
    next.setDate(next.getDate() + 1);
    return next;
  }
  if (r.freq === "hebdomadaire") {
    const target = r.weekday ?? 1; // lundi par défaut
    do {
      next.setDate(next.getDate() + 1);
    } while (next.getDay() !== target);
    return next;
  }
  // mensuelle
  const target = Math.min(Math.max(r.monthday ?? 1, 1), 28);
  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDate() !== target);
  return next;
}

// Une routine est « due » si l'échéance est aujourd'hui ou dépassée,
// et qu'elle n'a pas déjà tourné aujourd'hui.
export function isDue(r: Routine, now = new Date()): boolean {
  if (!r.enabled) return false;
  if (r.lastRun && dayKey(new Date(r.lastRun)) === dayKey(now)) return false;
  return dayKey(nextDue(r)) <= dayKey(now);
}

export const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function describeSchedule(r: Routine): string {
  if (r.freq === "quotidienne") return "Chaque jour";
  if (r.freq === "hebdomadaire") return `Chaque ${WEEKDAYS[r.weekday ?? 1].toLowerCase()}`;
  return `Le ${Math.min(Math.max(r.monthday ?? 1, 1), 28)} de chaque mois`;
}
