import fs from "node:fs";
import path from "node:path";

// Inscrits à la newsletter « Recevez nos analyses », stockés sur le disque de
// l'instance (data/newsletter.json). Alimente le cockpit et les notifications.
const FILE = path.join(process.cwd(), "data", "newsletter.json");

export type Subscriber = {
  email: string;
  date: string; // ISO
  source: string; // page d'origine
  read: boolean; // vu dans le cockpit ?
};

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
