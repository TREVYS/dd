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
