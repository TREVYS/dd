import fs from "node:fs";
import path from "node:path";
import { readAnalytics, lastDays } from "@/lib/analytics";
import { getSetting } from "@/lib/settings";

// Synthèse d'audience « pour dirigeant » : top 3 des pages, navigation,
// analyse rédigée par Alfred (mise en cache 24 h) et rapport hebdomadaire
// envoyé sur Telegram.

const ANALYSIS_FILE = path.join(process.cwd(), "data", "stats-analysis.json");
const REPORT_FILE = path.join(process.cwd(), "data", "stats-report.json");

const PAGE_LABELS: Record<string, string> = {
  "/": "Accueil",
  "/blog": "Ressources",
  "/facturation-electronique": "Facturation électronique",
  "/expertise-comptable": "Expertise comptable",
  "/consulting": "Consulting",
  "/intelligence-artificielle": "Intelligence artificielle",
  "/audit-organisationnel": "Audit organisationnel",
  "/le-cabinet": "Le cabinet",
  "/references": "Références",
  "/contact": "Contact",
  "/rendez-vous": "Rendez-vous",
  "/nous-rejoindre": "Nous rejoindre",
  "/notre-ecosysteme": "Écosystème",
};

export function pageLabel(p: string): string {
  if (PAGE_LABELS[p]) return PAGE_LABELS[p];
  if (p.startsWith("/blog/")) return `Article : ${p.slice(6).replace(/-/g, " ")}`;
  if (p.startsWith("/secteurs/")) return `Secteur : ${p.slice(10).replace(/-/g, " ")}`;
  if (p.startsWith("/le-cabinet/")) return `Associé : ${p.slice(12).replace(/-/g, " ")}`;
  return p;
}

export type StatsSummary = {
  totalViews: number;
  views7: number;
  views7Prev: number; // 7 jours précédents, pour la tendance
  trendPct: number | null;
  top3: { path: string; label: string; views: number; sharePct: number }[];
  topEvents: { name: string; count: number }[];
  topSources: { name: string; count: number; pct: number }[];
  devices: { name: string; count: number; pct: number }[];
  engagementPct: number;
};

export function buildStatsSummary(): StatsSummary {
  const a = readAnalytics();
  const d14 = lastDays(a, 14);
  const views7 = d14.slice(7).reduce((s, x) => s + x.views, 0);
  const views7Prev = d14.slice(0, 7).reduce((s, x) => s + x.views, 0);
  const trendPct = views7Prev > 0 ? Math.round(((views7 - views7Prev) / views7Prev) * 100) : null;
  const total = Math.max(1, a.totals.views);
  const top3 = Object.entries(a.paths)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 3)
    .map(([p, n]) => ({ path: p, label: pageLabel(p), views: n, sharePct: Math.round((n / total) * 100) }));
  const topEvents = Object.entries(a.events)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  const engagementPct = a.totals.views ? Math.min(100, Math.round((a.totals.events / a.totals.views) * 100)) : 0;
  const srcTotal = Math.max(1, Object.values(a.sources ?? {}).reduce((x, y) => x + y, 0));
  const topSources = Object.entries(a.sources ?? {})
    .sort((x, y) => y[1] - x[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / srcTotal) * 100) }));
  const devTotal = Math.max(1, Object.values(a.devices ?? {}).reduce((x, y) => x + y, 0));
  const devices = Object.entries(a.devices ?? {})
    .sort((x, y) => y[1] - x[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / devTotal) * 100) }));
  return { totalViews: a.totals.views, views7, views7Prev, trendPct, top3, topEvents, topSources, devices, engagementPct };
}

// Texte de secours (sans IA) : déjà utile, jamais bloquant.
function fallbackAnalysis(s: StatsSummary): string {
  const t1 = s.top3[0];
  const trend =
    s.trendPct === null ? "" : s.trendPct >= 0 ? ` La fréquentation progresse de ${s.trendPct} % sur 7 jours.` : ` La fréquentation recule de ${Math.abs(s.trendPct)} % sur 7 jours.`;
  return (
    `${s.views7} pages vues cette semaine.${trend} ` +
    (t1 ? `Votre page la plus consultée est « ${t1.label} » (${t1.sharePct} % des vues). ` : "") +
    `${s.engagementPct} % des visiteurs interagissent (clics, formulaires, téléchargements).`
  );
}

// Analyse d'Alfred, mise en cache 24 h (data/stats-analysis.json).
export async function alfredTrafficAnalysis(force = false): Promise<string> {
  const s = buildStatsSummary();
  try {
    if (!force && fs.existsSync(ANALYSIS_FILE)) {
      const cached = JSON.parse(fs.readFileSync(ANALYSIS_FILE, "utf8")) as { text?: string; at?: number };
      if (cached.text && cached.at && Date.now() - cached.at < 24 * 3600 * 1000) return cached.text;
    }
  } catch { /* cache illisible : on régénère */ }

  let text = fallbackAnalysis(s);
  const apiKey = getSetting("anthropicApiKey");
  if (apiKey && s.totalViews > 0) {
    try {
      const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
      const client = new AnthropicSDK({ apiKey });
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system:
          "Tu es Alfred, directeur de la communication du cabinet Trevys. Tu analyses l'audience du site www.trevys.fr pour John (le fondateur, pas un technicien). " +
          "Réponds en 3 à 5 phrases maximum, en français simple et direct : ce qui marche, ce qui bouge, et UNE recommandation concrète de communication (sujet d'article, post LinkedIn, mise en avant). " +
          "Pas de jargon, pas de liste, pas de titre — juste un court paragraphe utile.",
        messages: [
          {
            role: "user",
            content:
              `Données : ${s.views7} vues sur 7 jours (précédente semaine : ${s.views7Prev}${s.trendPct !== null ? `, tendance ${s.trendPct > 0 ? "+" : ""}${s.trendPct} %` : ""}). ` +
              `Top 3 pages : ${s.top3.map((t) => `${t.label} (${t.views} vues, ${t.sharePct} %)`).join(" ; ") || "aucune donnée"}. ` +
              `Interactions principales : ${s.topEvents.map((e) => `${e.name} (${e.count})`).join(" ; ") || "aucune"}. ` +
              `Provenance des visiteurs : ${s.topSources.map((x) => `${x.name} (${x.pct} %)`).join(" ; ") || "pas encore mesurée"}. ` +
              `Appareils : ${s.devices.map((x) => `${x.name} (${x.pct} %)`).join(" ; ") || "pas encore mesurés"}. ` +
              `Taux d'engagement global : ${s.engagementPct} %.`,
          },
        ],
      });
      const out = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim();
      if (out) text = out;
    } catch { /* on garde le texte de secours */ }
  }

  try {
    const dir = path.dirname(ANALYSIS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ANALYSIS_FILE, JSON.stringify({ text, at: Date.now() }), "utf8");
  } catch { /* disque en lecture seule */ }
  return text;
}

// Rapport hebdomadaire Telegram (au plus une fois tous les 7 jours ; déclenché
// à l'ouverture du cockpit, comme les routines d'Alfred).
export async function maybeSendWeeklyStatsReport(): Promise<void> {
  try {
    if (fs.existsSync(REPORT_FILE)) {
      const st = JSON.parse(fs.readFileSync(REPORT_FILE, "utf8")) as { lastSent?: number };
      if (st.lastSent && Date.now() - st.lastSent < 7 * 24 * 3600 * 1000) return;
    }
  } catch { /* état illisible : on tente l'envoi */ }

  const { telegramConfigured, sendTelegram } = await import("@/lib/notify");
  if (!telegramConfigured()) return;

  const s = buildStatsSummary();
  if (s.totalViews === 0) return; // rien à raconter

  // On « réserve » l'envoi avant l'appel réseau pour éviter tout doublon.
  try {
    const dir = path.dirname(REPORT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REPORT_FILE, JSON.stringify({ lastSent: Date.now() }), "utf8");
  } catch { /* sans persistance, tant pis : l'envoi reste utile */ }

  const analysis = await alfredTrafficAnalysis(true);
  const trend = s.trendPct === null ? "" : ` (${s.trendPct >= 0 ? "+" : ""}${s.trendPct} % vs semaine précédente)`;
  const lines = [
    `📊 Votre semaine sur trevys.fr`,
    ``,
    `${s.views7} pages vues${trend} · engagement ${s.engagementPct} %`,
    ``,
    `🏆 Top 3 :`,
    ...s.top3.map((t, i) => `${i + 1}. ${t.label} — ${t.views} vues (${t.sharePct} %)`),
    ``,
    ...(s.topSources.length
      ? [`🧭 Provenance : ${s.topSources.slice(0, 4).map((x) => `${x.name} ${x.pct} %`).join(" · ")}`, ``]
      : []),
    `🎩 L'analyse d'Alfred :`,
    analysis,
  ];
  await sendTelegram(lines.join("\n"), { plain: true });
}
