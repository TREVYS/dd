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

type Store = Record<
  string,
  {
    opens: Record<string, string>;
    // clics : par contact, puis par URL cliquée (compteur)
    clicks?: Record<string, Record<string, number>>;
  }
>;

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

// --- Suivi des clics --------------------------------------------------------

export function clickToken(campaignId: string, email: string, url: string): string {
  return crypto
    .createHmac("sha256", appSecret())
    .update(`nlclick:${campaignId}:${email.toLowerCase()}:${url}`)
    .digest("hex")
    .slice(0, 16);
}

// URL traquée : passe par /api/nl/c qui compte puis redirige vers la vraie page.
export function clickUrl(campaignId: string, email: string, url: string): string {
  const e = Buffer.from(email.toLowerCase()).toString("base64url");
  const u = Buffer.from(url).toString("base64url");
  return `${SITE_URL}/api/nl/c?c=${encodeURIComponent(campaignId)}&e=${e}&u=${u}&t=${clickToken(campaignId, email, url)}`;
}

export function recordClick(campaignId: string, email: string, url: string): void {
  const s = read();
  s[campaignId] = s[campaignId] ?? { opens: {} };
  s[campaignId].clicks = s[campaignId].clicks ?? {};
  const key = email.toLowerCase();
  s[campaignId].clicks![key] = s[campaignId].clicks![key] ?? {};
  s[campaignId].clicks![key][url] = (s[campaignId].clicks![key][url] ?? 0) + 1;
  // Un clic prouve l'ouverture (même si le pixel a été bloqué).
  if (!s[campaignId].opens[key]) s[campaignId].opens[key] = new Date().toISOString();
  write(s);
}

// Réécrit les liens http(s) d'un HTML d'e-mail en liens traqués — sauf les
// liens techniques (désinscription, pixel, réponses opt-in).
export function trackLinks(html: string, campaignId: string, email: string): string {
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (m, url) => {
    if (url.includes("/api/nl/") || url.includes("/api/newsletter") || url.includes("unsubscribe")) return m;
    return `href="${clickUrl(campaignId, email, url)}"`;
  });
}

// Détail complet d'une campagne pour la fiche d'analyse.
export type CampaignReport = {
  opens: { email: string; at: string }[];
  clickers: number;
  totalClicks: number;
  byUrl: { url: string; clicks: number; uniques: number }[];
  byContact: { email: string; clicks: number }[];
};

export function campaignReport(campaignId: string): CampaignReport {
  const c = read()[campaignId] ?? { opens: {} };
  const opens = Object.entries(c.opens)
    .map(([email, at]) => ({ email, at }))
    .sort((a, b) => a.at.localeCompare(b.at));
  const urlMap: Record<string, { clicks: number; uniq: Set<string> }> = {};
  const byContact: { email: string; clicks: number }[] = [];
  let totalClicks = 0;
  for (const [email, urls] of Object.entries(c.clicks ?? {})) {
    let n = 0;
    for (const [url, count] of Object.entries(urls)) {
      urlMap[url] = urlMap[url] ?? { clicks: 0, uniq: new Set() };
      urlMap[url].clicks += count;
      urlMap[url].uniq.add(email);
      n += count;
    }
    totalClicks += n;
    byContact.push({ email, clicks: n });
  }
  const byUrl = Object.entries(urlMap)
    .map(([url, v]) => ({ url, clicks: v.clicks, uniques: v.uniq.size }))
    .sort((a, b) => b.clicks - a.clicks);
  byContact.sort((a, b) => b.clicks - a.clicks);
  return { opens, clickers: byContact.length, totalClicks, byUrl, byContact };
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
