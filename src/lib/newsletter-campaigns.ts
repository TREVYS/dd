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

// Verrou anti double-envoi : un mailing peut être déclenché depuis trois
// endroits (bouton du cockpit, envoi programmé, Alfred) — sans ce verrou
// partagé, un double clic ou un chevauchement pouvait envoyer deux fois le
// même mailing à toute la liste.
const sending = new Set<string>();

export function isSending(id: string): boolean {
  return sending.has(id);
}

// Réserve l'envoi de cette campagne. Renvoie false si un envoi est déjà en
// cours pour cet id (à appeler AVANT toute expédition ; toujours libérer
// avec releaseSend, y compris en cas d'erreur).
export function claimSend(id: string): boolean {
  if (sending.has(id)) return false;
  sending.add(id);
  return true;
}

export function releaseSend(id: string): void {
  sending.delete(id);
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

// Désinscription « en un clic » (en-tête List-Unsubscribe des messageries) :
// même jeton signé, mais sur une adresse qui accepte la requête automatique
// envoyée par Gmail, Outlook, Apple Mail… quand le lecteur clique sur leur
// bouton « Se désabonner ».
export function unsubscribeOneClickUrl(email: string): string {
  return `${SITE_URL}/api/nl/unsub?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

// Version texte brut d'une campagne (jointe à la version mise en forme).
export function markdownToEmailText(md: string, unsubUrl?: string): string {
  const body = md
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      const l = line.trimEnd();
      if (/^(\[\[[^\]]+\]\]\s*)+$/.test(l.trim())) return [...l.matchAll(/\[\[([^\]]+)\]\]/g)].map((t) => t[1].trim().toUpperCase()).join(" · ");
      if (/^!\[[^\]]*\]\([^)]*\)\s*$/.test(l)) return null; // images : sans objet en texte
      if (/^---+$/.test(l.trim())) return "----------------------------------------";
      return l
        .replace(/^#{2,6}\s+/, "")
        .replace(/^>\s?/, "")
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, txt: string, url: string) => `${txt.replace(/\s*→\s*$/, "")} : ${url.startsWith("/") ? SITE_URL + url : url}`)
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/(^|[^*])\*([^*]+)\*/g, "$1$2");
    })
    .filter((l): l is string => l !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return (
    `${body}\n\n--\nT.A. Trevys Advisory — 1 rue Le Nôtre, 75016 Paris\n${SITE_URL}\n` +
    (unsubUrl ? `Se désinscrire : ${unsubUrl}\n` : "")
  );
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

// Forme arrondie pour Outlook de bureau (moteur Word) : il ignore
// border-radius et le rembourrage des liens — d'où des boutons carrés et
// énormes. On lui sert donc une forme vectorielle (VML) aux dimensions
// fixes, et le HTML/CSS normal à tous les autres clients (Gmail, Apple Mail,
// mobile, Outlook web). Les deux versions ne s'affichent jamais ensemble.
function msoPill(opts: { href?: string; label: string; width: number; height: number; fill: string; color: string; fontSize: number }): string {
  const { href, label, width, height, fill, color, fontSize } = opts;
  return (
    `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" ` +
    (href ? `href="${href}" ` : "") +
    `style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="50%" stroke="f" fillcolor="${fill}">` +
    `<w:anchorlock/><center style="color:${color};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:bold;">${label}</center>` +
    `</v:roundrect><![endif]-->`
  );
}
const notMso = (html: string) => `<!--[if !mso]><!-- -->${html}<!--<![endif]-->`;

// Largeur approximative d'un libellé en Arial gras (Outlook exige une
// largeur fixe pour la forme vectorielle).
function textWidth(label: string, fontSize: number): number {
  const plain = label.replace(/&[a-z#0-9]+;/gi, "x");
  return Math.round(plain.length * fontSize * 0.6);
}

// Bouton d'action : pilule orange, identique partout (voir msoPill).
// L'espacement autour est porté par une cellule de tableau : Outlook ignore
// les marges des tableaux, ce qui collait le texte suivant au bouton.
function emailButton(rawHref: string, label: string): string {
  const href = esc(abs(rawHref));
  const text = `${label}&nbsp;&rarr;`;
  const width = Math.max(150, Math.min(440, textWidth(text, 15) + 56));
  return (
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:6px 0 24px;">` +
    msoPill({ href, label: text, width, height: 44, fill: "#E26A0F", color: "#ffffff", fontSize: 15 }) +
    notMso(
      `<a href="${href}" style="display:inline-block;background-color:#E26A0F;border-radius:100px;padding:13px 28px;` +
      `font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:18px;font-weight:bold;color:#ffffff;text-decoration:none;">${text}</a>`,
    ) +
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
      : l.startsWith("club")
        ? ["#2E9E6B", "#ffffff", "#23805a"]
        : ["#f6efe3", "#6b5f4c", "#eadfcd"];
  const text = esc(label).toUpperCase();
  return (
    msoPill({ label: text, width: textWidth(text, 10) + 26, height: 20, fill: bg, color: fg, fontSize: 10 }) +
    `<!--[if mso]>&nbsp;<![endif]-->` +
    notMso(
      `<span style="display:inline-block;padding:3px 10px;margin:0 5px 0 0;font-family:Arial,Helvetica,sans-serif;` +
      `font-size:10px;line-height:14px;font-weight:bold;letter-spacing:.4px;color:${fg};` +
      `background-color:${bg};border:1px solid ${border};border-radius:100px;">${text}</span>`,
    )
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
      out.push(`<h3 style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.35;margin:14px 0 8px;color:#1a1208;">${inline(line.replace(/^#{3}\s+/, ""))}</h3>`);
    } else if (/^(\[\[[^\]]+\]\]\s*)+$/.test(line.trim())) {
      // Ligne composée uniquement d'étiquettes [[…]] → rangée de pastilles.
      flushList();
      const tags = [...line.matchAll(/\[\[([^\]]+)\]\]/g)].map((t) => emailTag(t[1].trim()));
      out.push(
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:6px 0 2px;">${tags.join("")}</td></tr></table>`,
      );
    } else if ((m = line.match(/^!\[([^\]]*)\|(droite|gauche|right|left)\]\(([^)\s]+)\)\s*$/i))) {
      // Vignette d'article : ![alt|droite](url) ou ![alt|gauche](url).
      // Volontairement PAS en image flottante (align+float) : Outlook (moteur
      // Word) enroule mal le texte autour, d'où un rendu qui « bave ». La
      // vignette est affichée en bloc, au-dessus du texte — rendu identique
      // et propre partout.
      flushList();
      out.push(
        `<img src="${esc(abs(m[3]))}" alt="${esc(m[1])}" width="220" ` +
        `style="display:block;width:220px;max-width:55%;height:auto;border-radius:12px;border:1px solid #eadfcd;box-shadow:0 8px 20px -10px rgba(60,40,10,.25);margin:4px 0 14px;" />`,
      );
    } else if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      // Image pleine largeur (depuis la médiathèque ou une URL).
      flushList();
      out.push(`<img src="${esc(abs(m[2]))}" alt="${esc(m[1])}" width="532" style="display:block;width:100%;max-width:100%;height:auto;border-radius:12px;box-shadow:0 8px 20px -10px rgba(60,40,10,.25);margin:0 0 18px;" />`);
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
      // Filet fin dans un tableau : <hr> sort épais et gris foncé dans Outlook.
      out.push(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:8px 0 26px;">` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>` +
        `<td height="1" bgcolor="#f0e4d3" style="height:1px;font-size:0;line-height:0;background-color:#f0e4d3;">&nbsp;</td>` +
        `</tr></table></td></tr></table>`,
      );
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
// Pastille sociale ronde (lettre/glyphe + couleur de marque) : plus "pro"
// qu'un lien texte, et fiable en e-mail (table + border-radius, se dégrade
// en carré discret sur les clients qui ignorent le radius — jamais cassé).
function socialBadge(href: string, label: string, bg: string): string {
  return (
    msoPill({ href, label, width: 34, height: 34, fill: bg, color: "#ffffff", fontSize: 13 }) +
    `<!--[if mso]>&nbsp;&nbsp;<![endif]-->` +
    notMso(
      `<a href="${href}" style="display:inline-block;width:34px;height:34px;line-height:34px;margin:0 5px;border-radius:50%;` +
      `background-color:${bg};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#ffffff;text-align:center;text-decoration:none;">${label}</a>`,
    )
  );
}

export function wrapEmail(
  bodyHtml: string,
  unsubUrl?: string,
  footerNote?: string,
  heroUrl?: string,
): string {
  const logo = `${SITE_URL}/uploads/1.png`;
  const font = "font-family:Arial,Helvetica,sans-serif;";
  const social =
    socialBadge("https://www.linkedin.com/company/trevys-advisory/", "in", "#0A66C2") +
    socialBadge("https://x.com/JohnLevy0", "X", "#111111") +
    socialBadge("https://www.youtube.com/@Trevysadvisory", "&#9654;", "#E23D28");
  return `<!doctype html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Trevys</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><style>table{border-collapse:collapse;}p{margin:0 0 16px;}</style><![endif]-->
</head>
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

        ${heroUrl ? `<!-- Bannière --><tr><td style="padding:0 0 18px;"><img src="${abs(heroUrl)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border-radius:16px;" /></td></tr>` : ""}

        <!-- Carte principale -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="border-radius:16px;border:1px solid #eadfcd;box-shadow:0 10px 30px -14px rgba(60,40,10,.18);">
            <tr><td bgcolor="#F5811F" height="6" style="height:6px;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
            <tr><td style="padding:32px 34px 26px;${font}font-size:15px;color:#2a241c;line-height:1.65;">
              ${bodyHtml}
            </td></tr>
          </table>
        </td></tr>

        <!-- Réseaux sociaux -->
        <tr><td align="center" style="padding:26px 8px 4px;">${social}</td></tr>

        <!-- Liens rapides -->
        <tr><td align="center" style="padding:14px 8px 6px;${font}font-size:13px;">
          <a href="${SITE_URL}" style="color:#E26A0F;font-weight:bold;text-decoration:none;">www.trevys.fr</a>
          &nbsp;&nbsp;&bull;&nbsp;&nbsp;
          <a href="${SITE_URL}/rendez-vous" style="color:#E26A0F;font-weight:bold;text-decoration:none;">Prendre rendez-vous</a>
        </td></tr>

        <!-- Pied de page (compact, centré) -->
        <tr><td align="center" style="padding:10px 10px 20px;${font}font-size:10px;color:#a89b86;line-height:1.8;text-align:center;">
          <b style="color:#8a7d67;font-size:11px;">T.A. Trevys Advisory</b><br>
          1 rue Le Nôtre, 75016 Paris<br>
          <a href="mailto:contact@trevys.fr" style="color:#a89b86;text-decoration:none;">contact@trevys.fr</a><br>
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
