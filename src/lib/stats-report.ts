import fs from "node:fs";
import path from "node:path";
import { readAnalytics, lastDays, type Analytics } from "@/lib/analytics";
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

// --- Analyse par période (jour / semaine / mois / année) -------------------
export type Periode = "jour" | "semaine" | "mois" | "annee";

export type PeriodStats = {
  label: string;
  views: number; // vues de la période
  prevViews: number; // période précédente (comparaison)
  trendPct: number | null;
  events: number;
  series: { label: string; views: number }[]; // barres du graphe
};

function sumRange(a: Analytics, from: Date, to: Date): { views: number; events: number } {
  let views = 0, events = 0;
  const d = new Date(from);
  while (d <= to) {
    const k = d.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
    views += a.days[k]?.views ?? 0;
    events += a.days[k]?.events ?? 0;
    d.setDate(d.getDate() + 1);
  }
  return { views, events };
}

export function periodStats(a: Analytics, periode: Periode): PeriodStats {
  const now = new Date();
  const dayKey = (d: Date) => d.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
  const shift = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };

  if (periode === "jour") {
    const views = a.days[dayKey(now)]?.views ?? 0;
    const events = a.days[dayKey(now)]?.events ?? 0;
    const prevViews = a.days[dayKey(shift(-1))]?.views ?? 0;
    // Graphe : les 7 derniers jours pour situer la journée.
    const series = Array.from({ length: 7 }, (_, i) => {
      const d = shift(i - 6);
      return { label: dayKey(d).slice(8), views: a.days[dayKey(d)]?.views ?? 0 };
    });
    return { label: "Aujourd'hui", views, prevViews, trendPct: prevViews > 0 ? Math.round(((views - prevViews) / prevViews) * 100) : null, events, series };
  }

  if (periode === "semaine" || periode === "mois") {
    const n = periode === "semaine" ? 7 : 30;
    const cur = sumRange(a, shift(-(n - 1)), now);
    const prev = sumRange(a, shift(-(2 * n - 1)), shift(-n));
    const series = Array.from({ length: n }, (_, i) => {
      const d = shift(i - (n - 1));
      return { label: dayKey(d).slice(8), views: a.days[dayKey(d)]?.views ?? 0 };
    });
    return {
      label: periode === "semaine" ? "7 derniers jours" : "30 derniers jours",
      views: cur.views, prevViews: prev.views,
      trendPct: prev.views > 0 ? Math.round(((cur.views - prev.views) / prev.views) * 100) : null,
      events: cur.events, series,
    };
  }

  // Année : 12 mois glissants, barres mensuelles.
  const months: { label: string; views: number }[] = [];
  let views = 0, events = 0;
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    let mv = 0;
    for (const [k, v] of Object.entries(a.days)) {
      if (k.startsWith(prefix)) { mv += v.views; events += v.events; }
    }
    views += mv;
    months.push({ label: d.toLocaleDateString("fr-FR", { month: "short" }), views: mv });
  }
  return { label: "12 derniers mois", views, prevViews: 0, trendPct: null, events, series: months };
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

// --- Conseils d'Alfred pour la visibilité (tableau de bord) ---------------
// 3 recommandations concrètes, basées sur l'audience ET l'état de la
// communication (dernier article, brouillons en attente, abonnés).
const ADVICE_FILE = path.join(process.cwd(), "data", "alfred-advice.json");

export type AdviceTip = { text: string; prompt: string };

function fallbackAdvice(s: StatsSummary): AdviceTip[] {
  const tips: AdviceTip[] = [];
  if (s.top3[0]) {
    tips.push({
      text: `Votre page « ${s.top3[0].label} » attire le plus de monde : déclinez-la en post LinkedIn cette semaine.`,
      prompt: `Rédige un post LinkedIn court à partir de notre contenu « ${s.top3[0].label} » (notre page la plus visitée).`,
    });
  }
  if (s.trendPct !== null && s.trendPct < 0) {
    tips.push({
      text: "La fréquentation baisse : publiez un article d'actualité pour relancer les visites.",
      prompt: "Rédige un article d'actualité économique ou fiscale de la semaine, utile pour des dirigeants.",
    });
  } else {
    tips.push({
      text: "Publiez régulièrement (1 article + 2 posts par semaine) pour installer votre visibilité.",
      prompt: "Propose-moi un calendrier éditorial pour les 2 prochaines semaines (articles + posts LinkedIn).",
    });
  }
  tips.push({
    text: "Poussez vos derniers articles en newsletter : vos abonnés sont vos meilleurs relais.",
    prompt: "Rédige une newsletter qui met en avant nos derniers articles publiés.",
  });
  return tips.slice(0, 3);
}

export async function alfredAdvice(): Promise<AdviceTip[]> {
  const s = buildStatsSummary();
  try {
    if (fs.existsSync(ADVICE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(ADVICE_FILE, "utf8")) as { tips?: (AdviceTip | string)[]; at?: number };
      if (cached.tips?.length && cached.at && Date.now() - cached.at < 24 * 3600 * 1000) {
        // Compatibilité : anciens caches en simples chaînes.
        return cached.tips.map((t) =>
          typeof t === "string" ? { text: t, prompt: t } : t,
        );
      }
    }
  } catch { /* cache illisible : on régénère */ }

  let tips = fallbackAdvice(s);
  const apiKey = getSetting("anthropicApiKey");
  if (apiKey && s.totalViews > 0) {
    try {
      // Contexte de communication : dernier article, file d'attente, abonnés.
      const { getAllPosts } = await import("@/lib/blog");
      const { listPosts } = await import("@/lib/social-posts");
      const { listSubscribers } = await import("@/lib/newsletter");
      const posts = getAllPosts();
      const lastArticleDays = posts[0]?.date
        ? Math.max(0, Math.round((Date.now() - new Date(posts[0].date).getTime()) / 86400000))
        : null;
      const queue = listPosts().filter((p) => p.status !== "publie").length;

      const { default: AnthropicSDK } = await import("@anthropic-ai/sdk");
      const client = new AnthropicSDK({ apiKey });
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system:
          "Tu es Alfred, directeur de la communication du cabinet Trevys. À partir des données d'audience et de l'état de la communication, " +
          "donne EXACTEMENT 3 conseils concrets et actionnables pour améliorer la visibilité du cabinet (sujets à traiter, canaux à pousser, actions de la semaine). " +
          "Réponds UNIQUEMENT avec 3 lignes, une par conseil, au format strict : « conseil :: consigne » — " +
          "le conseil est une phrase directe de 25 mots max pour John ; la consigne est l'instruction exacte que John pourra t'envoyer pour exécuter ce conseil (ex. « Rédige un post LinkedIn sur… »). En français, sans numérotation.",
        messages: [
          {
            role: "user",
            content:
              `Audience : ${s.views7} vues/7 j (tendance ${s.trendPct ?? "n/c"} %). Top pages : ${s.top3.map((t) => `${t.label} ${t.sharePct} %`).join(" ; ") || "n/c"}. ` +
              `Provenance : ${s.topSources.map((x) => `${x.name} ${x.pct} %`).join(" ; ") || "pas encore mesurée"}. ` +
              `Interactions : ${s.topEvents.map((e) => `${e.name} ${e.count}`).join(" ; ") || "aucune"}. ` +
              `Communication : dernier article publié il y a ${lastArticleDays ?? "?"} jour(s), ${queue} post(s) réseaux en attente de validation, ${listSubscribers().length} abonné(s) newsletter.`,
          },
        ],
      });
      const out = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("").trim();
      const lines = out.split(/\n+/).map((l) => l.replace(/^[-•\d.\s]+/, "").trim()).filter(Boolean).slice(0, 3);
      const parsed = lines.map((l) => {
        const [text, prompt] = l.split("::").map((x) => x.trim());
        return { text: text || l, prompt: prompt || text || l };
      });
      if (parsed.length >= 2) tips = parsed;
    } catch { /* on garde les conseils de secours */ }
  }

  try {
    const dir = path.dirname(ADVICE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADVICE_FILE, JSON.stringify({ tips, at: Date.now() }), "utf8");
  } catch { /* disque en lecture seule */ }
  return tips;
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
