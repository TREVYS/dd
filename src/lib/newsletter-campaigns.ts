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

// --- Désinscription -------------------------------------------------------

import { SITE_URL } from "@/lib/site";
import { appSecret } from "@/lib/app-secret";

// Jeton signé propre à chaque adresse : le lien de désinscription ne peut
// pas être forgé pour désinscrire quelqu'un d'autre.
export function unsubscribeToken(email: string): string {
  return crypto.createHmac("sha256", appSecret()).update(email.toLowerCase().trim()).digest("hex").slice(0, 24);
}

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/desinscription?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

// --- Rendu e-mail --------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// URL absolue et sûre : uniquement http(s) ou chemins internes. Toute autre
// valeur (javascript:, guillemets, etc.) est neutralisée en "#".
function abs(url: string): string {
  const u = url.trim();
  if (u.startsWith("/")) return `${SITE_URL}${encodeURI(u)}`;
  if (/^https?:\/\//i.test(u) && !/["'<>\s]/.test(u)) return u;
  return "#";
}

// Markdown simple → HTML (titres, gras, italique, liens, listes, paragraphes).
function inline(s: string): string {
  return esc(s)
    // Le texte est déjà échappé ; on capture les liens sur la forme échappée.
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt, url) => {
      const safe = abs(url.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
      return `<a href="${esc(safe)}" style="color:#E26A0F;font-weight:600;">${txt}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

// Bouton « bulletproof » : structure en tableau + couleurs pleines, le seul
// motif fiable dans Outlook (les dégradés et certains fonds y sont supprimés).
function emailButton(rawHref: string, label: string): string {
  const href = esc(abs(rawHref));
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>` +
    `<td bgcolor="#E26A0F" style="background-color:#E26A0F;border-radius:100px;mso-padding-alt:12px 28px;">` +
    `<a href="${href}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;background-color:#E26A0F;text-decoration:none;border-radius:100px;border:1px solid #C2410C;">${label}&nbsp;&rarr;</a>` +
    `</td></tr></table>`
  );
}

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
      out.push(
        `<h2 style="font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:1.3;margin:28px 0 10px;color:#1a1208;border-left:4px solid #F5811F;padding-left:14px;">${inline(line.replace(/^#{2}\s+/, ""))}</h2>`,
      );
    } else if (/^#{3}\s+/.test(line)) {
      flushList();
      out.push(`<h3 style="font-family:Arial,Helvetica,sans-serif;font-size:17px;margin:20px 0 8px;color:#1a1208;">${inline(line.replace(/^#{3}\s+/, ""))}</h3>`);
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      // Image pleine largeur (depuis la médiathèque ou une URL).
      flushList();
      out.push(`<img src="${esc(abs(m[2]))}" alt="${esc(m[1])}" width="532" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin:0 0 18px;" />`);
    } else if ((m = line.match(/^\[([^\]]+)\]\(([^)\s]+)\)\s*$/))) {
      // Ligne composée d'un seul lien → bouton d'action (fiable Outlook).
      flushList();
      out.push(emailButton(m[2], esc(m[1].replace(/\s*→\s*$/, ""))));
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

// Enveloppe l'HTML du corps dans un gabarit e-mail aux couleurs Trevys.
// Structure en tableaux : c'est la seule mise en page réellement fiable dans
// tous les clients (Outlook en tête).
export function wrapEmail(bodyHtml: string, unsubUrl?: string): string {
  const logo = `${SITE_URL}/uploads/1.png`;
  const font = "font-family:Arial,Helvetica,sans-serif;";
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trevys</title></head>
<body style="margin:0;padding:0;background-color:#f2ece2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2ece2">
    <tr><td align="center" style="padding:28px 12px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">

        <!-- En-tête : logo -->
        <tr><td align="center" style="padding:4px 0 20px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${logo}" alt="Trevys" height="44" style="height:44px;max-width:230px;border:0;display:block;" />
          </a>
        </td></tr>

        <!-- Carte principale -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:16px;border:1px solid #eadfcd;">
            <tr><td bgcolor="#F5811F" height="6" style="height:6px;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
            <tr><td style="padding:32px 34px 26px;${font}font-size:15px;color:#2a241c;line-height:1.65;">
              ${bodyHtml}
            </td></tr>
          </table>
        </td></tr>

        <!-- Bouton site, bien visible et centré -->
        <tr><td align="center" style="padding:22px 8px 4px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td align="center" bgcolor="#1B1712" style="border-radius:100px;">
              <a href="${SITE_URL}" style="display:inline-block;padding:13px 34px;${font}font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:100px;letter-spacing:.02em;">
                Visiter www.trevys.fr
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Liens rapides -->
        <tr><td align="center" style="padding:14px 8px 6px;${font}font-size:13px;">
          <a href="https://www.linkedin.com/company/trevys-advisory/" style="color:#E26A0F;font-weight:bold;text-decoration:none;">LinkedIn</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="${SITE_URL}/rendez-vous" style="color:#E26A0F;font-weight:bold;text-decoration:none;">Prendre rendez-vous</a>
        </td></tr>

        <!-- Pied de page -->
        <tr><td align="center" style="padding:8px 10px 20px;${font}font-size:12px;color:#9d907c;line-height:1.7;">
          <b style="color:#6b5f4c;">T.A. Trevys Advisory</b> — Expertise comptable &amp; conseil<br>
          1 rue Le Nôtre, 75116 Paris &middot; contact@trevys-advisory.fr<br>
          Vous recevez cet e-mail car vous êtes inscrit à nos analyses.<br>
          ${unsubUrl
            ? `<a href="${unsubUrl}" style="color:#9d907c;text-decoration:underline;">Se désinscrire en un clic</a>`
            : `Pour ne plus les recevoir, répondez simplement &laquo;&nbsp;stop&nbsp;&raquo;.`}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
