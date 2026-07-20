import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

export type LegalDoc = {
  slug: string;
  title: string;
  updated?: string;
  content: string;
};

export function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function getLegalDoc(slug: string): LegalDoc | null {
  const full = path.join(LEGAL_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    slug,
    title: String(data.title ?? slug),
    updated: data.updated ? String(data.updated) : undefined,
    content,
  };
}

export function listLegalDocs(): { slug: string; title: string; updated?: string }[] {
  if (!fs.existsSync(LEGAL_DIR)) return [];
  return fs
    .readdirSync(LEGAL_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(LEGAL_DIR, f), "utf8"));
      return { slug, title: String(data.title ?? slug), updated: data.updated ? String(data.updated) : undefined };
    });
}

// Met à jour un document légal existant (titre + contenu). Tamponne la date.
export function saveLegalDoc(slug: string, title: string, content: string): void {
  if (!fs.existsSync(LEGAL_DIR)) fs.mkdirSync(LEGAL_DIR, { recursive: true });
  const fm = { title: title.trim(), updated: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(path.join(LEGAL_DIR, `${slug}.mdx`), matter.stringify(`\n${content.trim()}\n`, fm), "utf8");
}
