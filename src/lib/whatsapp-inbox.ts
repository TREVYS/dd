import fs from "node:fs";
import path from "node:path";

// File des messages clients reçus sur WhatsApp Business, avec le brouillon
// de réponse proposé par Alfred — en attente de validation (« go ») par John.
// Stockée sur le disque de l'instance : data/whatsapp-inbox.json.
const FILE = path.join(process.cwd(), "data", "whatsapp-inbox.json");

export type WhatsAppThread = {
  id: string;
  fromPhone: string; // numéro E.164 (sans +), identifiant WhatsApp
  fromName?: string;
  clientMessage: string;
  draftReply?: string;
  status: "en_attente" | "repondu";
  createdAt: string;
  repliedAt?: string;
};

function read(): WhatsAppThread[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(threads: WhatsAppThread[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(threads, null, 2), "utf8");
}

export function listThreads(): WhatsAppThread[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getThread(id: string): WhatsAppThread | undefined {
  return read().find((t) => t.id === id);
}

export function addThread(input: {
  fromPhone: string;
  fromName?: string;
  clientMessage: string;
  draftReply?: string;
}): WhatsAppThread {
  const threads = read();
  const thread: WhatsAppThread = {
    id: Math.random().toString(36).slice(2, 10),
    fromPhone: input.fromPhone,
    fromName: input.fromName,
    clientMessage: input.clientMessage,
    draftReply: input.draftReply,
    status: "en_attente",
    createdAt: new Date().toISOString(),
  };
  threads.push(thread);
  // Garde un historique raisonnable (200 derniers échanges).
  write(threads.slice(-200));
  return thread;
}

export function updateThread(id: string, patch: Partial<WhatsAppThread>): WhatsAppThread | undefined {
  const threads = read();
  const i = threads.findIndex((t) => t.id === id);
  if (i === -1) return undefined;
  threads[i] = { ...threads[i], ...patch };
  write(threads);
  return threads[i];
}
