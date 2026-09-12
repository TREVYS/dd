import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Campagnes de mailing (newsletters préparées puis envoyées via Microsoft 365).
// Stockées sur le disque de l'instance : data/newsletter-campaigns.json.
const FILE = path.join(process.cwd(), "data", "newsletter-campaigns.json");

export type CampaignStatus = "brouillon" | "envoye";

// Ciblage d'un mailing : filtres sur les inscrits, exclusions individuelles
// et adresses ajoutées à la main. Mémorisé à la programmation pour que
// l'envoi différé parte aux MÊMES destinataires que ceux choisis à l'écran.
export type CampaignTarget = {
  includeSubscribers: boolean;
  fClient: string; // tous | oui | non
  fProfil: string;
  fq: string;
  exclude: string[]; // e-mails écartés un à un
  extra: string[]; // adresses ajoutées à la main
};

export type Campaign = {
  id: string;
  subject: string;
  body: string; // Markdown simple
  status: CampaignStatus;
  createdAt: string;
  sentAt?: string;
  sentCount?: number;
  sendAt?: string; // AAAA-MM-JJ — envoi programmé (traité par le planificateur)
  target?: CampaignTarget; // ciblage mémorisé (envoi programmé)
};

// Applique un ciblage à la base d'inscrits → liste finale d'adresses (uniques,
// minuscules). Sans ciblage mémorisé : tous les abonnés (comportement historique).
export function resolveTargetRecipients(target: CampaignTarget | undefined, subscribers: { email: string; name?: string; client?: boolean; profil?: string }[]): string[] {
  if (!target) return [...new Set(subscribers.map((s) => s.email.toLowerCase()))];
  const excl = new Set(target.exclude.map((e) => e.toLowerCase()));
  const set = new Set<string>();
  if (target.includeSubscribers) {
    const fProfil = target.fProfil.trim().toLowerCase();
    const fq = target.fq.trim().toLowerCase();
    for (const s of subscribers) {
      if (target.fClient === "oui" && s.client !== true) continue;
      if (target.fClient === "non" && s.client === true) continue;
      if (fProfil && (s.profil ?? "").toLowerCase() !== fProfil) continue;
      if (fq && !`${s.email} ${s.name ?? ""} ${s.profil ?? ""}`.toLowerCase().includes(fq)) continue;
      set.add(s.email.toLowerCase());
    }
  }
  for (const e of target.extra) set.add(e.toLowerCase());
  for (const e of excl) set.delete(e);
  return [...set];
}

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

export type ArticleSendInfo = { count: number; lastSentAt: string; subjects: string[] };

// Historique d'envoi par article : détecte les liens /blog/<slug> dans le
// corps des mailings ENVOYÉS (composer_mailing_articles et le composeur par
// articles du cockpit y placent tous ce lien). Permet d'afficher une pastille
// « déjà envoyé » sur les articles, dans le back-office comme à la
// préparation d'un mailing.
export function articleSendHistory(): Record<string, ArticleSendInfo> {
  const history: Record<string, ArticleSendInfo> = {};
  const sent = readAll()
    .filter((c) => c.status === "envoye" && c.sentAt)
    .sort((a, b) => a.sentAt!.localeCompare(b.sentAt!));
  for (const c of sent) {
    const slugs = new Set([...c.body.matchAll(/\/blog\/([a-z0-9-]+)/gi)].map((m) => m[1]));
    for (const slug of slugs) {
      const info = history[slug] ?? { count: 0, lastSentAt: c.sentAt!, subjects: [] };
      info.count += 1;
      info.lastSentAt = c.sentAt!;
      info.subjects.push(c.subject);
      history[slug] = info;
    }
  }
  return history;
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

// --- Garde-fou anti-sur-sollicitation -------------------------------------
// Avant tout envoi, on vérifie le dernier mailing parti : s'il date de moins
// de SEND_COOLDOWN_DAYS jours, l'envoi exige une confirmation humaine.
export const SEND_COOLDOWN_DAYS = 15;

export function lastSentInfo(excludeId?: string): { subject: string; sentAt: string; days: number } | null {
  const sent = readAll()
    .filter((c) => c.status === "envoye" && c.sentAt && c.id !== excludeId)
    .sort((a, b) => b.sentAt!.localeCompare(a.sentAt!));
  if (sent.length === 0) return null;
  const days = Math.floor((Date.now() - Date.parse(sent[0].sentAt!)) / 86_400_000);
  return { subject: sent[0].subject, sentAt: sent[0].sentAt!, days };
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
    // Rembourrage porté par la cellule UNIQUEMENT (le porter aussi sur le
    // lien fait un double cadre dans Outlook).
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>` +
    `<td bgcolor="#E26A0F" style="background-color:#E26A0F;border-radius:100px;padding:12px 28px;">` +
    `<a href="${href}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${label}&nbsp;&rarr;</a>` +
    `</td></tr></table>`
  );
}

// Pastille d'étiquette (ex. métier) : [[Consulting]] ou [[Expertise comptable]]
// seuls sur leur ligne. Couleurs par métier, ton neutre pour le reste.
function emailTag(label: string): string {
  const l = label.toLowerCase();
  const [bg, fg, border] = l.startsWith("consulting")
    ? ["#1f2a44", "#ffffff", "#1f2a44"]
    : l.startsWith("expertise")
      ? ["#E26A0F", "#ffffff", "#C2410C"]
      : ["#f6efe3", "#6b5f4c", "#eadfcd"];
  return (
    `<span style="display:inline-block;padding:2px 9px;margin:0 5px 0 0;font-family:Arial,Helvetica,sans-serif;` +
    `font-size:10px;font-weight:bold;letter-spacing:.4px;text-transform:uppercase;color:${fg};` +
    `background-color:${bg};border:1px solid ${border};border-radius:100px;">${esc(label)}</span>`
  );
}

// Identifiant YouTube depuis une URL (youtu.be/ID ou youtube.com/watch?v=ID).
function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? m[1] : null;
}

// Carte vidéo discrète : petite miniature à gauche, titre et lien à droite.
// (Aucun client mail ne lit la vidéo en place : c'est le motif fiable.)
function emailVideo(url: string, label: string): string {
  const id = youtubeId(url);
  const href = esc(abs(url));
  const thumb = id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : "";
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" ` +
    `style="margin:8px 0 20px;background-color:#faf6ef;border:1px solid #eadfcd;border-radius:10px;"><tr>` +
    (thumb
      ? `<td width="150" style="padding:10px 0 10px 10px;vertical-align:middle;">` +
        // Dimensions fixes (16:9) : si la miniature ne charge pas, la carte
        // reste compacte au lieu d'afficher un grand carré cassé.
        `<a href="${href}"><img src="${thumb}" alt="" width="150" height="84" style="display:block;width:150px;height:84px;object-fit:cover;border-radius:8px;border:0;background-color:#e8e0d2;" /></a></td>`
      : "") +
    `<td style="padding:10px 14px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">` +
    `<span style="display:block;font-size:14px;font-weight:bold;color:#1a1208;line-height:1.4;margin-bottom:4px;">${esc(label || "Notre vidéo")}</span>` +
    `<a href="${href}" style="font-size:13px;font-weight:bold;color:#E26A0F;text-decoration:none;">Regarder la vidéo&nbsp;&rarr;</a>` +
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
        `<h2 style="font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:1.3;margin:28px 0 10px;clear:both;color:#1a1208;border-left:4px solid #F5811F;padding-left:14px;">${inline(line.replace(/^#{2}\s+/, ""))}</h2>`,
      );
    } else if (/^#{3}\s+/.test(line)) {
      flushList();
      out.push(`<h3 style="font-family:Arial,Helvetica,sans-serif;font-size:17px;margin:20px 0 8px;clear:both;color:#1a1208;">${inline(line.replace(/^#{3}\s+/, ""))}</h3>`);
    } else if (/^(\[\[[^\]]+\]\]\s*)+$/.test(line.trim())) {
      // Ligne composée uniquement d'étiquettes [[…]] → rangée de pastilles.
      flushList();
      const tags = [...line.matchAll(/\[\[([^\]]+)\]\]/g)].map((t) => emailTag(t[1].trim()));
      out.push(`<div style="margin:24px 0 -12px;clear:both;">${tags.join("")}</div>`);
    } else if ((m = line.match(/^!\[([^\]]*)\|(droite|gauche|right|left)\]\(([^)\s]+)\)\s*$/i))) {
      // Image flottante : ![alt|droite](url) ou ![alt|gauche](url) — petite
      // vignette autour de laquelle le texte s'enroule (couvertures d'articles).
      flushList();
      const right = /droite|right/i.test(m[2]);
      out.push(
        `<img src="${esc(abs(m[3]))}" alt="${esc(m[1])}" width="150" align="${right ? "right" : "left"}" ` +
        `style="width:150px;height:auto;border-radius:8px;border:1px solid #eadfcd;margin:${right ? "4px 0 10px 16px" : "4px 16px 10px 0"};" />`,
      );
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      // Image pleine largeur (depuis la médiathèque ou une URL).
      flushList();
      out.push(`<img src="${esc(abs(m[2]))}" alt="${esc(m[1])}" width="532" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin:0 0 18px;" />`);
    } else if ((m = line.match(/^\[([^\]]+)\]\(([^)\s]+)\)\s*$/))) {
      flushList();
      if (youtubeId(m[2])) {
        // Lien YouTube seul sur sa ligne → carte vidéo (miniature + bouton).
        out.push(emailVideo(m[2], m[1].replace(/^[▶►\s]+/, "").replace(/\s*→\s*$/, "")));
      } else {
        // Ligne composée d'un seul lien → bouton d'action (fiable Outlook).
        out.push(emailButton(m[2], esc(m[1].replace(/\s*→\s*$/, ""))));
      }
    } else if (/^>\s?/.test(line)) {
      // Citation / encadré : lignes « > … » → bloc mis en avant.
      flushList();
      out.push(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;"><tr>` +
        `<td style="background-color:#fdf6ec;border-left:4px solid #F5811F;border-radius:0 8px 8px 0;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">${inline(line.replace(/^>\s?/, ""))}</td>` +
        `</tr></table>`,
      );
    } else if (/^---+$/.test(line.trim())) {
      flushList();
      out.push(`<hr style="border:none;border-top:1px solid #f0e4d3;margin:26px 0;clear:both;" />`);
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
export function wrapEmail(bodyHtml: string, unsubUrl?: string, footerNote?: string): string {
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

        <!-- Liens rapides -->
        <tr><td align="center" style="padding:20px 8px 6px;${font}font-size:13px;">
          <a href="${SITE_URL}" style="color:#E26A0F;font-weight:bold;text-decoration:none;">www.trevys.fr</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="https://www.linkedin.com/company/trevys-advisory/" style="color:#E26A0F;font-weight:bold;text-decoration:none;">LinkedIn</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="${SITE_URL}/rendez-vous" style="color:#E26A0F;font-weight:bold;text-decoration:none;">Prendre rendez-vous</a>
        </td></tr>

        <!-- Pied de page (compact, centré) -->
        <tr><td align="center" style="padding:10px 10px 20px;${font}font-size:10px;color:#a89b86;line-height:1.8;text-align:center;">
          <b style="color:#8a7d67;font-size:11px;">T.A. Trevys Advisory</b><br>
          1 rue Le Nôtre, 75116 Paris<br>
          <a href="mailto:contact@trevys-advisory.fr" style="color:#a89b86;text-decoration:none;">contact@trevys-advisory.fr</a><br>
          ${footerNote ?? "Vous recevez cet e-mail car vous êtes inscrit à nos analyses."}<br>
          ${unsubUrl
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:8px auto 0;"><tr><td align="center" style="border:1px solid #d8cbb4;border-radius:100px;">` +
              `<a href="${unsubUrl}" style="display:inline-block;padding:5px 14px;${font}font-size:10px;color:#8a7d67;text-decoration:none;border-radius:100px;">Se désinscrire</a>` +
              `</td></tr></table>`
            : ""}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
