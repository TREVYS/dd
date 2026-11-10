import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parisToday } from "@/lib/dates";

// Tâches personnelles de John (todo) : ajoutées depuis le cockpit, le chat
// d'Alfred ou Telegram. Une tâche terminée est archivée (elle reste
// consultable dans l'onglet « Archives »). Stockage : data/tasks.json.
const FILE = path.join(process.cwd(), "data", "tasks.json");
const STATE_FILE = path.join(process.cwd(), "data", "tasks-digest.json");

export type TaskPriority = "haute" | "normale" | "basse";
export type TaskSource = "cockpit" | "alfred" | "telegram";

export type Task = {
  id: string;
  title: string;
  note?: string;
  due?: string; // AAAA-MM-JJ
  priority: TaskPriority;
  done: boolean;
  createdAt: string; // ISO
  doneAt?: string; // ISO — date d'archivage
  source: TaskSource;
};

function read(): Task[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(tasks: Task[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(tasks, null, 2), "utf8");
}

const PRIO_RANK: Record<TaskPriority, number> = { haute: 0, normale: 1, basse: 2 };

// Tâches ouvertes, triées : en retard / échéance la plus proche d'abord,
// puis sans échéance ; à échéance égale, la priorité haute passe devant.
export function listOpenTasks(): Task[] {
  return read()
    .filter((t) => !t.done)
    .sort((a, b) => {
      const da = a.due ?? "9999-99-99";
      const db = b.due ?? "9999-99-99";
      if (da !== db) return da < db ? -1 : 1;
      if (a.priority !== b.priority) return PRIO_RANK[a.priority] - PRIO_RANK[b.priority];
      return a.createdAt < b.createdAt ? -1 : 1;
    });
}

// Tâches archivées, les plus récemment terminées d'abord.
export function listArchivedTasks(): Task[] {
  return read()
    .filter((t) => t.done)
    .sort((a, b) => ((a.doneAt ?? "") < (b.doneAt ?? "") ? 1 : -1));
}

export function getTask(id: string): Task | undefined {
  return read().find((t) => t.id === id);
}

export function normalizeDue(v: unknown): string | undefined {
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
}

export function normalizePriority(v: unknown): TaskPriority {
  return v === "haute" || v === "basse" ? v : "normale";
}

export function addTask(input: { title: string; note?: string; due?: string; priority?: TaskPriority; source: TaskSource }): Task {
  const t: Task = {
    id: crypto.randomBytes(5).toString("hex"),
    title: input.title.trim().slice(0, 300),
    note: input.note?.trim() || undefined,
    due: normalizeDue(input.due),
    priority: input.priority ?? "normale",
    done: false,
    createdAt: new Date().toISOString(),
    source: input.source,
  };
  write([...read(), t]);
  return t;
}

export function updateTask(id: string, patch: Partial<Pick<Task, "title" | "note" | "due" | "priority">>): Task | undefined {
  let found: Task | undefined;
  write(
    read().map((t) => {
      if (t.id !== id) return t;
      found = { ...t, ...patch };
      return found;
    }),
  );
  return found;
}

// Terminer = archiver.
export function completeTask(id: string): Task | undefined {
  let found: Task | undefined;
  write(read().map((t) => (t.id === id ? (found = { ...t, done: true, doneAt: new Date().toISOString() }) : t)));
  return found;
}

export function reopenTask(id: string): Task | undefined {
  let found: Task | undefined;
  write(read().map((t) => (t.id === id ? (found = { ...t, done: false, doneAt: undefined }) : t)));
  return found;
}

export function removeTask(id: string): boolean {
  const all = read();
  const next = all.filter((t) => t.id !== id);
  write(next);
  return next.length !== all.length;
}

// Nombre de tâches en retard ou dues aujourd'hui (pastille du menu).
export function urgentTaskCount(): number {
  const today = parisToday();
  return listOpenTasks().filter((t) => t.due && t.due <= today).length;
}

// Résumé compact pour le contexte d'Alfred.
export function tasksContextBlock(): string {
  const open = listOpenTasks();
  if (open.length === 0) return "TÂCHES DE JOHN : aucune tâche ouverte.";
  const today = parisToday();
  const lines = open.slice(0, 40).map((t) => {
    const late = t.due && t.due < today ? " — EN RETARD" : t.due === today ? " — AUJOURD'HUI" : "";
    return `- [${t.id}] ${t.title}${t.due ? ` (échéance ${t.due}${late})` : ""}${t.priority !== "normale" ? ` [priorité ${t.priority}]` : ""}`;
  });
  return `TÂCHES DE JOHN (${open.length} ouverte(s), date du jour ${today}) :\n${lines.join("\n")}`;
}

// Rappel Telegram du matin (une fois par jour, à partir de 8 h) : tâches en
// retard et du jour, plus le nombre total de tâches ouvertes. Rien n'est
// envoyé s'il n'y a aucune tâche ouverte.
export async function maybeSendDailyTasksDigest(): Promise<void> {
  const today = parisToday();
  const hour = Number(new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", hour12: false }));
  if (!(hour >= 8)) return;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const st = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as { lastSentDay?: string };
      if (st.lastSentDay === today) return;
    }
  } catch { /* état illisible : on tente l'envoi */ }

  const { telegramConfigured, sendTelegram } = await import("@/lib/notify");
  if (!telegramConfigured()) return;
  const open = listOpenTasks();

  // Réservation avant l'envoi : jamais deux rappels le même jour.
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastSentDay: today }), "utf8");
  } catch { /* sans persistance, tant pis */ }
  if (open.length === 0) return;

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const late = open.filter((t) => t.due && t.due < today);
  const now = open.filter((t) => t.due === today);
  const prio = open.filter((t) => t.priority === "haute" && (!t.due || t.due > today));
  const fmt = (t: Task) => `• ${esc(t.title)}${t.due && t.due < today ? ` <i>(prévu le ${t.due.split("-").reverse().join("/")})</i>` : ""}`;
  const parts = [`☀️ <b>Bonjour John — votre todo du jour</b>`];
  if (late.length) parts.push(`\n🔴 <b>En retard</b>\n${late.map(fmt).join("\n")}`);
  if (now.length) parts.push(`\n🟠 <b>Aujourd'hui</b>\n${now.map(fmt).join("\n")}`);
  if (prio.length) parts.push(`\n⭐ <b>Prioritaires</b>\n${prio.slice(0, 5).map(fmt).join("\n")}`);
  parts.push(`\n${open.length} tâche(s) ouverte(s) au total. Répondez « c'est fait : … » pour en archiver une.`);
  await sendTelegram(parts.join("\n"));
}
