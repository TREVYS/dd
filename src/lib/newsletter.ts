import fs from "node:fs";
import path from "node:path";

// Inscrits à la newsletter « Recevez nos analyses », stockés sur le disque de
// l'instance (data/newsletter.json). Alimente le cockpit et les notifications.
const FILE = path.join(process.cwd(), "data", "newsletter.json");

export type Subscriber = {
  email: string;
  date: string; // ISO
  source: string; // page d'origine (ou "import")
  read: boolean; // vu dans le cockpit ?
  name?: string; // nom du contact (import / édition cockpit)
  client?: boolean; // axe 1 : client du cabinet ?
  profil?: string; // axe 2 : DAF, BNC, BNC santé, Dirigeant…
};

// Profils suggérés (axe 2) — la saisie libre reste possible.
export const PROFILS = ["DAF", "BNC", "BNC santé", "Dirigeant", "Expert-comptable", "Autre"];

type Store = { subscribers: Subscriber[] };

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return { subscribers: [] };
    return { subscribers: [], ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return { subscribers: [] };
  }
}

function write(store: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

// Ajoute (ou met à jour) un inscrit. Renvoie true s'il est nouveau.
export function addSubscriber(email: string, source = "site"): boolean {
  const store = read();
  const existing = store.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (existing) return false;
  store.subscribers.unshift({ email, date: new Date().toISOString(), source, read: false });
  write(store);
  return true;
}

export function listSubscribers(): Subscriber[] {
  return read().subscribers;
}

// Met à jour les informations d'un contact (nom, client, profil…).
export function updateSubscriber(email: string, patch: Partial<Subscriber>): boolean {
  const store = read();
  const s = store.subscribers.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!s) return false;
  Object.assign(s, patch, { email: s.email });
  write(store);
  return true;
}

// Import en masse depuis un fichier plat (CSV/TSV). Les désinscrits ne sont
// jamais réimportés. Un contact existant est mis à jour (nom, client, profil).
export function importContacts(
  rows: { email: string; name?: string; client?: boolean; profil?: string }[],
): { added: number; updated: number; skipped: number } {
  const store = read();
  const unsub = new Set(listUnsubscribed().map((u) => u.email));
  const byEmail = new Map(store.subscribers.map((s) => [s.email.toLowerCase(), s]));
  let added = 0, updated = 0, skipped = 0;
  for (const r of rows) {
    const email = r.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || unsub.has(email)) { skipped++; continue; }
    const existing = byEmail.get(email);
    if (existing) {
      if (r.name) existing.name = r.name;
      if (r.client !== undefined) existing.client = r.client;
      if (r.profil) existing.profil = r.profil;
      updated++;
    } else {
      const s: Subscriber = {
        email, date: new Date().toISOString(), source: "import", read: true,
        name: r.name || undefined, client: r.client, profil: r.profil || undefined,
      };
      store.subscribers.unshift(s);
      byEmail.set(email, s);
      added++;
    }
  }
  write(store);
  return { added, updated, skipped };
}

// Interprète un fichier plat : séparateur ; , ou tabulation, avec ou sans
// ligne d'en-tête (email / nom / client / profil, dans n'importe quel ordre).
export function parseContactsFile(text: string): { email: string; name?: string; client?: boolean; profil?: string }[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const sep = (l: string) => (l.includes("\t") ? "\t" : l.includes(";") ? ";" : ",");
  const split = (l: string) => l.split(sep(l)).map((c) => c.trim().replace(/^"|"$/g, ""));

  // En-tête ? (aucune adresse e-mail sur la première ligne)
  const first = split(lines[0]);
  const hasHeader = !first.some((c) => c.includes("@"));
  const norm = (h: string) => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  let idx = { email: -1, name: -1, client: -1, profil: -1 };
  if (hasHeader) {
    first.forEach((h, i) => {
      const n = norm(h);
      if (/mail/.test(n)) idx.email = i;
      else if (/nom|name|contact/.test(n)) idx.name = i;
      else if (/client/.test(n)) idx.client = i;
      else if (/profil|categorie|type|metier/.test(n)) idx.profil = i;
    });
  }
  const body = hasHeader ? lines.slice(1) : lines;
  const truthy = (v: string) => /^(oui|yes|1|true|x|client)$/i.test(v.trim());

  return body.map((line) => {
    const cells = split(line);
    if (idx.email >= 0) {
      return {
        email: cells[idx.email] ?? "",
        name: idx.name >= 0 ? cells[idx.name] : undefined,
        client: idx.client >= 0 && cells[idx.client] !== undefined && cells[idx.client] !== "" ? truthy(cells[idx.client]) : undefined,
        profil: idx.profil >= 0 ? cells[idx.profil] || undefined : undefined,
      };
    }
    // Sans en-tête : l'e-mail est la cellule qui contient un @, le reste
    // est interprété au mieux (nom, puis oui/non client, puis profil).
    const email = cells.find((c) => c.includes("@")) ?? "";
    const rest = cells.filter((c) => c !== email && c !== "");
    const clientCell = rest.find((c) => /^(oui|non|yes|no|0|1|true|false)$/i.test(c));
    const restNoClient = rest.filter((c) => c !== clientCell);
    return {
      email,
      name: restNoClient[0],
      client: clientCell !== undefined ? truthy(clientCell) : undefined,
      profil: restNoClient[1],
    };
  }).filter((r) => r.email);
}

export function unreadCount(): number {
  return read().subscribers.filter((s) => !s.read).length;
}

export function removeSubscriber(email: string): boolean {
  const store = read();
  const next = store.subscribers.filter((s) => s.email.toLowerCase() !== email.toLowerCase());
  if (next.length === store.subscribers.length) return false;
  write({ subscribers: next });
  return true;
}

// --- Désinscrits ----------------------------------------------------------
// Journal des personnes qui ont cliqué « Se désinscrire » : elles restent
// identifiables dans le cockpit (et ne sont jamais réinvitées par erreur).
const UNSUB_FILE = path.join(process.cwd(), "data", "newsletter-unsubscribed.json");

export type Unsubscribed = { email: string; date: string };

export function listUnsubscribed(): Unsubscribed[] {
  try {
    if (!fs.existsSync(UNSUB_FILE)) return [];
    return JSON.parse(fs.readFileSync(UNSUB_FILE, "utf8")) as Unsubscribed[];
  } catch {
    return [];
  }
}

export function markUnsubscribed(email: string) {
  const e = email.toLowerCase().trim();
  const items = listUnsubscribed();
  if (items.some((u) => u.email === e)) return;
  items.unshift({ email: e, date: new Date().toISOString() });
  const dir = path.dirname(UNSUB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(UNSUB_FILE, JSON.stringify(items, null, 2), "utf8");
}

export function markAllRead() {
  const store = read();
  store.subscribers.forEach((s) => (s.read = true));
  write(store);
}
