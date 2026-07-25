import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { appSecret } from "@/lib/app-secret";
import { SITE_URL } from "@/lib/site";

// Suivi d'ouverture des newsletters (pixel invisible par destinataire).
// Stockage : data/newsletter-stats.json — { [campaignId]: { opens: { email: dateISO } } }
// Limite connue : certains clients mail (Apple Mail notamment) préchargent les
// images — le taux d'ouverture est un ordre de grandeur, pas une vérité absolue.

const FILE = path.join(process.cwd(), "data", "newsletter-stats.json");

type Store = Record<string, { opens: Record<string, string> }>;

function read(): Store {
  try {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(s, null, 2), "utf8");
}

// Jeton signé : impossible de gonfler les stats en devinant des URL.
export function openToken(campaignId: string, email: string): string {
  return crypto.createHmac("sha256", appSecret()).update(`nlopen:${campaignId}:${email.toLowerCase()}`).digest("hex").slice(0, 16);
}

// URL du pixel à insérer dans l'e-mail de ce destinataire.
export function openPixelUrl(campaignId: string, email: string): string {
  const e = Buffer.from(email.toLowerCase()).toString("base64url");
  return `${SITE_URL}/api/nl/o?c=${encodeURIComponent(campaignId)}&e=${e}&t=${openToken(campaignId, email)}`;
}

export function recordOpen(campaignId: string, email: string): void {
  const s = read();
  s[campaignId] = s[campaignId] ?? { opens: {} };
  const key = email.toLowerCase();
  if (!s[campaignId].opens[key]) {
    s[campaignId].opens[key] = new Date().toISOString();
    write(s);
  }
}

// Statistiques d'une campagne : nombre d'ouvertures uniques.
export function campaignOpens(campaignId: string): number {
  return Object.keys(read()[campaignId]?.opens ?? {}).length;
}

// Activité par contact, toutes campagnes confondues.
export type ContactActivity = { opens: number; lastOpen?: string };

export function contactActivity(): Record<string, ContactActivity> {
  const out: Record<string, ContactActivity> = {};
  for (const camp of Object.values(read())) {
    for (const [email, at] of Object.entries(camp.opens)) {
      const cur = out[email] ?? { opens: 0 };
      cur.opens += 1;
      if (!cur.lastOpen || at > cur.lastOpen) cur.lastOpen = at;
      out[email] = cur;
    }
  }
  return out;
}
