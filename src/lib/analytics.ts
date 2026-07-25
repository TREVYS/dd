import fs from "node:fs";
import path from "node:path";

// Stockage simple (fichier JSON) des indicateurs de visite et d'interaction.
// Suffisant pour une instance unique ; à migrer vers une base si trafic élevé.
const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "analytics.json");

export type Analytics = {
  totals: { views: number; events: number };
  days: Record<string, { views: number; events: number }>;
  paths: Record<string, number>;
  events: Record<string, number>;
  // Provenance et appareil — comptés une fois par visite (pas par page vue).
  sources: Record<string, number>;
  devices: Record<string, number>;
  updatedAt: string;
};

function empty(): Analytics {
  return {
    totals: { views: 0, events: 0 },
    days: {}, paths: {}, events: {}, sources: {}, devices: {},
    updatedAt: "",
  };
}

export function readAnalytics(): Analytics {
  try {
    if (!fs.existsSync(FILE)) return empty();
    return { ...empty(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
  } catch {
    return empty();
  }
}

function write(a: Analytics) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    a.updatedAt = new Date().toISOString();
    fs.writeFileSync(FILE, JSON.stringify(a, null, 2), "utf8");
  } catch {
    /* disque en lecture seule : on ignore silencieusement */
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Classe l'adresse de provenance en source lisible.
export function classifySource(referrer: string): string {
  if (!referrer) return "Accès direct";
  try {
    const h = new URL(referrer).hostname.toLowerCase();
    if (h.includes("trevys")) return ""; // navigation interne : ignorée
    if (h.includes("google")) return "Google";
    if (h.includes("bing")) return "Bing";
    if (h.includes("linkedin") || h === "lnkd.in") return "LinkedIn";
    if (h.includes("facebook") || h === "fb.me") return "Facebook";
    if (h.includes("instagram")) return "Instagram";
    if (h.includes("twitter") || h === "t.co" || h === "x.com") return "X (Twitter)";
    if (h.includes("youtube")) return "YouTube";
    if (h.includes("duckduckgo")) return "DuckDuckGo";
    if (h.includes("ecosia")) return "Ecosia";
    return h.replace(/^www\./, "");
  } catch {
    return "Accès direct";
  }
}

export function trackView(pathname: string, visit?: { source?: string; device?: string }) {
  const a = readAnalytics();
  const d = today();
  a.totals.views += 1;
  a.days[d] = a.days[d] ?? { views: 0, events: 0 };
  a.days[d].views += 1;
  const key = pathname.slice(0, 120) || "/";
  a.paths[key] = (a.paths[key] ?? 0) + 1;
  // Début de visite : on note la provenance et l'appareil (une fois par session).
  if (visit?.source) a.sources[visit.source.slice(0, 60)] = (a.sources[visit.source.slice(0, 60)] ?? 0) + 1;
  if (visit?.device) a.devices[visit.device] = (a.devices[visit.device] ?? 0) + 1;
  write(a);
}

export function trackEvent(name: string) {
  const a = readAnalytics();
  const d = today();
  a.totals.events += 1;
  a.days[d] = a.days[d] ?? { views: 0, events: 0 };
  a.days[d].events += 1;
  const key = name.slice(0, 60);
  a.events[key] = (a.events[key] ?? 0) + 1;
  write(a);
}

// Renvoie les N derniers jours (du plus ancien au plus récent) pour un graphe.
export function lastDays(a: Analytics, n = 14): { day: string; views: number; events: number }[] {
  const out: { day: string; views: number; events: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const day = dt.toISOString().slice(0, 10);
    const v = a.days[day] ?? { views: 0, events: 0 };
    out.push({ day, views: v.views, events: v.events });
  }
  return out;
}
