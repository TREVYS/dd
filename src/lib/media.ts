import fs from "node:fs";
import path from "node:path";
import { slugify } from "@/lib/blog";

// Médias importés : stockés sur le disque de l'instance (persistant sur Gandi)
// dans public/uploads/, servis publiquement à l'adresse /uploads/<fichier>.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

export const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

export type MediaItem = { name: string; url: string; size: number; mtime: number };

function ensureDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function listUploads(): MediaItem[] {
  if (!fs.existsSync(UPLOAD_DIR)) return [];
  return fs
    .readdirSync(UPLOAD_DIR)
    .filter((f) => !f.startsWith(".") && f !== "README.md")
    .map((f) => {
      const st = fs.statSync(path.join(UPLOAD_DIR, f));
      return { name: f, url: `/uploads/${f}`, size: st.size, mtime: st.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

// Enregistre un fichier importé. Renvoie l'URL publique.
export async function saveUpload(
  buffer: Buffer,
  originalName: string,
  mime: string,
): Promise<MediaItem> {
  const ext = ALLOWED[mime];
  if (!ext) throw new Error("Type de fichier non autorisé (images et PDF uniquement).");
  if (buffer.byteLength > MAX_BYTES) throw new Error("Fichier trop volumineux (max 8 Mo).");

  ensureDir();
  const base =
    slugify(originalName.replace(/\.[^.]+$/, "")).slice(0, 60) || "media";
  let name = `${base}.${ext}`;
  let i = 1;
  while (fs.existsSync(path.join(UPLOAD_DIR, name))) {
    name = `${base}-${i++}.${ext}`;
  }
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  const st = fs.statSync(path.join(UPLOAD_DIR, name));
  return { name, url: `/uploads/${name}`, size: st.size, mtime: st.mtimeMs };
}

export function deleteUpload(name: string): boolean {
  // Sécurité : pas de traversée de répertoire.
  const safe = path.basename(name);
  const full = path.join(UPLOAD_DIR, safe);
  if (!full.startsWith(UPLOAD_DIR) || !fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
