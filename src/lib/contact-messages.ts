import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Messages reçus via le formulaire de contact — archivés sur le disque de
// l'instance (data/contact-messages.json) pour n'en perdre aucun, même si
// l'envoi d'e-mail échoue.
const FILE = path.join(process.cwd(), "data", "contact-messages.json");

export type ContactMessage = {
  id: string;
  date: string; // ISO
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
};

function readAll(): ContactMessage[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as ContactMessage[];
  } catch {
    return [];
  }
}

function writeAll(items: ContactMessage[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function listMessages(): ContactMessage[] {
  return readAll().sort((a, b) => b.date.localeCompare(a.date));
}

export function unreadMessages(): number {
  return readAll().filter((m) => !m.read).length;
}

export function addMessage(input: Omit<ContactMessage, "id" | "date" | "read">): ContactMessage {
  const items = readAll();
  const m: ContactMessage = {
    ...input,
    id: crypto.randomBytes(6).toString("hex"),
    date: new Date().toISOString(),
    read: false,
  };
  items.push(m);
  writeAll(items);
  return m;
}

export function markMessageRead(id: string) {
  writeAll(readAll().map((m) => (m.id === id ? { ...m, read: true } : m)));
}

export function removeMessage(id: string) {
  writeAll(readAll().filter((m) => m.id !== id));
}
