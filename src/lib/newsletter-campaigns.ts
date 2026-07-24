import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Campagnes de mailing (newsletters préparées puis envoyées via Microsoft 365).
// Stockées sur le disque de l'instance : data/newsletter-campaigns.json.
const FILE = path.join(process.cwd(), "data", "newsletter-campaigns.json");

export type CampaignStatus = "brouillon" | "envoye";

export type Campaign = {
  id: string;
  subject: string;
  body: string; // Markdown simple
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  sentCount?: number;
};

function readAll(): Campaign[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Campaign[];
  } catch {
    return [];
  }
}

function writeAll(items: Campaign[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), "utf8");
}

export function listCampaigns(): Campaign[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCampaign(id: string): Campaign | undefined {
  return readAll().find((c) => c.id === id);
}

export function addCampaign(subject: string, body: string): Campaign {
  const items = readAll();
  const c: Campaign = {
    id: crypto.randomBytes(6).toString("hex"),
    subject: subject || "Sans objet",
    body: body || "",
    status: "brouillon",
    createdAt: new Date().toISOString(),
  };
  items.push(c);
  writeAll(items);
  return c;
}

export function updateCampaign(id: string, patch: Partial<Campaign>) {
  const items = readAll();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...patch };
  writeAll(items);
}

export function removeCampaign(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}

// --- Rendu e-mail --------------------------------------------------------

import { SITE_URL } from "@/lib/site";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// URL absolue (les clients mail ne connaissent pas les chemins relatifs).
function abs(url: string): string {
  return url.startsWith("/") ? `${SITE_URL}${url}` : url;
}

// Markdown simple → HTML (titres, gras, italique, liens, listes, paragraphes).
function inline(s: string): string {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, url) =>
      `<a href="${abs(url)}" style="color:#E26A0F;font-weight:600;">${txt}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

const BTN_STYLE =
  "display:inline-block;background:linear-gradient(135deg,#F5811F,#E26A0F);color:#ffffff;" +
  "font-weight:700;font-size:15px;text-decoration:none;padding:12px 26px;border-radius:100px;";

export function markdownToEmailHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: string[] | null = null;

  const flushList = () => {
    if (list) {
      out.push(`<ul style="margin:0 0 16px 20px;padding:0;">${list.join("")}</ul>`);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if (/^#{2}\s+/.test(line)) {
      flushList();
      out.push(`<h2 style="font-size:21px;margin:26px 0 10px;color:#1a1208;letter-spacing:-.01em;">${inline(line.replace(/^#{2}\s+/, ""))}</h2>`);
    } else if (/^#{3}\s+/.test(line)) {
      flushList();
      out.push(`<h3 style="font-size:17px;margin:20px 0 8px;color:#1a1208;">${inline(line.replace(/^#{3}\s+/, ""))}</h3>`);
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      // Image pleine largeur (depuis la médiathèque ou une URL).
      flushList();
      out.push(`<img src="${abs(m[2])}" alt="${esc(m[1])}" style="display:block;width:100%;max-width:100%;border-radius:12px;margin:0 0 18px;" />`);
    } else if ((m = line.match(/^\[([^\]]+)\]\(([^)\s]+)\)\s*$/))) {
      // Ligne composée d'un seul lien → bouton d'action.
      flushList();
      out.push(`<p style="margin:6px 0 22px;"><a href="${abs(m[2])}" style="${BTN_STYLE}">${esc(m[1])}</a></p>`);
    } else if (/^---+$/.test(line.trim())) {
      flushList();
      out.push(`<hr style="border:none;border-top:1px solid #f0e4d3;margin:26px 0;" />`);
    } else if (/^[-*]\s+/.test(line)) {
      (list ??= []).push(`<li style="margin:0 0 6px;">${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      out.push(`<p style="margin:0 0 16px;line-height:1.65;">${inline(line)}</p>`);
    }
  }
  flushList();
  return out.join("\n");
}

// Enveloppe l'HTML du corps dans un gabarit e-mail aux couleurs Trevys :
// bandeau orange, logo, carte blanche, pied de page complet.
export function wrapEmail(bodyHtml: string): string {
  const logo = `${SITE_URL}/uploads/1.png`;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4efe8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2a241c;">
  <div style="max-width:620px;margin:0 auto;padding:26px 14px;">

    <!-- En-tête : logo -->
    <div style="text-align:center;padding:6px 0 18px;">
      <a href="${SITE_URL}" style="text-decoration:none;">
        <img src="${logo}" alt="Trevys" height="46" style="height:46px;max-width:240px;object-fit:contain;" />
      </a>
    </div>

    <!-- Carte principale -->
    <div style="background:#ffffff;border-radius:18px;border:1px solid #efe5d6;overflow:hidden;">
      <div style="height:5px;background:linear-gradient(90deg,#F5811F,#E8B33C);"></div>
      <div style="padding:34px 34px 28px;">
        ${bodyHtml}
      </div>
    </div>

    <!-- Pied de page -->
    <div style="text-align:center;color:#9d907c;font-size:12px;padding:22px 10px;line-height:1.7;">
      <div style="margin-bottom:8px;">
        <a href="${SITE_URL}" style="color:#E26A0F;font-weight:700;text-decoration:none;">www.trevys.fr</a>
        &nbsp;·&nbsp;
        <a href="https://www.linkedin.com/company/trevys-advisory/" style="color:#E26A0F;font-weight:700;text-decoration:none;">LinkedIn</a>
        &nbsp;·&nbsp;
        <a href="${SITE_URL}/rendez-vous" style="color:#E26A0F;font-weight:700;text-decoration:none;">Prendre rendez-vous</a>
      </div>
      <b style="color:#6b5f4c;">T.A. Trevys Advisory</b> — Expertise comptable &amp; conseil<br>
      1 rue Le Nôtre, 75116 Paris · contact@trevys-advisory.fr<br>
      Vous recevez cet e-mail car vous êtes inscrit à nos analyses.
      Pour ne plus les recevoir, répondez simplement « stop ».
    </div>
  </div>
</body></html>`;
}
