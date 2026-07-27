import fs from "node:fs";
import path from "node:path";
import { getStudio, saveStudio } from "@/lib/ig-studio";

// Génération des visuels Instagram (sharp) — module séparé du studio pour ne
// jamais entraîner sharp dans les bundles Edge.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function escXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// Coupe un texte en lignes d'environ `max` caractères, sans casser les mots.
function wrapText(text: string, max: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.join(" ").length > lines.join(" ").length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, " …").trim();
  }
  return lines;
}

// Génère un visuel Instagram 1080×1080 : maquette de fond (rotation entre les
// maquettes des Réglages, ou fond aux couleurs du cabinet), voile sombre en
// bas, titre en grand, sous-titre optionnel, pastille « trevys.fr ».
export async function makeInstagramVisual(
  title: string,
  subtitle?: string,
  templateUrl?: string, // maquette imposée (Studio design) — sinon rotation
): Promise<{ url: string }> {
  // Chargé à l'exécution via createRequire : sharp est natif et ne doit
  // jamais entrer dans les bundles (l'inclusion Edge casse le build).
  const { createRequire } = await import("node:module");
  const sharp = createRequire(path.join(process.cwd(), "package.json"))("sharp") as typeof import("sharp");
  const W = 1080;
  const studio = getStudio();

  // Rotation entre les maquettes pour varier les fonds d'un post à l'autre.
  const usable = studio.templates.filter((t) => {
    const p = path.join(UPLOAD_DIR, path.basename(t));
    return fs.existsSync(p);
  });
  let base: import("sharp").Sharp;
  const forced = templateUrl && fs.existsSync(path.join(UPLOAD_DIR, path.basename(templateUrl)))
    ? path.join(UPLOAD_DIR, path.basename(templateUrl))
    : null;
  if (forced) {
    base = sharp(forced).resize(W, W, { fit: "cover" });
  } else if (usable.length > 0) {
    const idx = ((studio.lastTemplate ?? -1) + 1) % usable.length;
    saveStudio({ lastTemplate: idx });
    base = sharp(path.join(UPLOAD_DIR, path.basename(usable[idx]))).resize(W, W, { fit: "cover" });
  } else {
    // Pas de maquette : fond maison (beige Trevys + bandeau orange).
    const bg = `<svg width="${W}" height="${W}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${W}" fill="#F2ECE2"/>
      <rect y="0" width="${W}" height="14" fill="#F5811F"/>
      <circle cx="920" cy="180" r="260" fill="#F5811F" opacity="0.12"/>
      <circle cx="140" cy="880" r="200" fill="#1f2a44" opacity="0.08"/>
    </svg>`;
    base = sharp(Buffer.from(bg));
  }

  const titleLines = wrapText(title, 24, 4);
  const font = "DejaVu Sans, Arial, sans-serif";
  const lineH = 86;
  const titleBlockH = titleLines.length * lineH;
  const subLines = subtitle ? wrapText(subtitle, 44, 2) : [];
  const subBlockH = subLines.length * 44;
  const bottomPad = 90;
  const textTop = W - bottomPad - subBlockH - (subBlockH ? 24 : 0) - titleBlockH;

  const overlay = `<svg width="${W}" height="${W}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1B1712" stop-opacity="0"/>
        <stop offset="1" stop-color="#1B1712" stop-opacity="0.82"/>
      </linearGradient>
    </defs>
    <rect y="${W - titleBlockH - subBlockH - 300}" width="${W}" height="${titleBlockH + subBlockH + 300}" fill="url(#scrim)"/>
    <rect x="70" y="86" rx="26" width="250" height="52" fill="#F5811F"/>
    <text x="195" y="121" text-anchor="middle" font-family="${font}" font-size="28" font-weight="bold" fill="#ffffff">trevys.fr</text>
    <rect x="70" y="${textTop - 34}" width="120" height="10" fill="#F5811F"/>
    ${titleLines
      .map(
        (l, i) =>
          `<text x="70" y="${textTop + (i + 1) * lineH - 22}" font-family="${font}" font-size="72" font-weight="bold" fill="#ffffff">${escXml(l)}</text>`,
      )
      .join("")}
    ${subLines
      .map(
        (l, i) =>
          `<text x="70" y="${textTop + titleBlockH + 30 + i * 44}" font-family="${font}" font-size="32" fill="#f2ece2">${escXml(l)}</text>`,
      )
      .join("")}
  </svg>`;

  const buffer = await base
    .composite([{ input: Buffer.from(overlay) }])
    .png()
    .toBuffer();

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  let name = `ig-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 6)}.png`;
  while (fs.existsSync(path.join(UPLOAD_DIR, name))) {
    name = `ig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.png`;
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return { url: `/uploads/${name}` };
}
