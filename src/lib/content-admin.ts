import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slugify } from "@/lib/blog";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type ArticleInput = {
  slug?: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  author?: string;
  image?: string;
  body: string;
};

function ensureDir() {
  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
}

export function getRawArticle(slug: string): ArticleInput | null {
  const full = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    slug,
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    category: String(data.category ?? "Article"),
    excerpt: String(data.excerpt ?? ""),
    author: data.author ? String(data.author) : "",
    image: data.image ? String(data.image) : "",
    body: content.trim(),
  };
}

// Crée ou met à jour un article MDX. Renvoie le slug final.
export function saveArticle(input: ArticleInput, originalSlug?: string): string {
  ensureDir();
  const slug = (input.slug && input.slug.trim()) || slugify(input.title);
  if (!slug) throw new Error("Titre ou slug requis.");

  const frontmatter: Record<string, string> = {
    title: input.title.trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    category: input.category.trim() || "Article",
    excerpt: input.excerpt.trim(),
  };
  if (input.author?.trim()) frontmatter.author = input.author.trim();
  if (input.image?.trim()) frontmatter.image = input.image.trim();

  const file = matter.stringify(`\n${input.body.trim()}\n`, frontmatter);
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.mdx`), file, "utf8");

  // Renommage : supprimer l'ancien fichier si le slug a changé.
  if (originalSlug && originalSlug !== slug) {
    const old = path.join(BLOG_DIR, `${originalSlug}.mdx`);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  return slug;
}

export function deleteArticle(slug: string): boolean {
  const full = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}

// --- Pages personnalisées (rendues sur /p/[slug]) ---
const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export type PageInput = {
  slug?: string;
  title: string;
  description?: string;
  body: string;
};

export type PageMeta = { slug: string; title: string; description: string };

export function listPages(): PageMeta[] {
  if (!fs.existsSync(PAGES_DIR)) return [];
  return fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(PAGES_DIR, f), "utf8"));
      return { slug, title: String(data.title ?? slug), description: String(data.description ?? "") };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getPage(slug: string): { meta: PageMeta; body: string } | null {
  const full = path.join(PAGES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    meta: { slug, title: String(data.title ?? slug), description: String(data.description ?? "") },
    body: content.trim(),
  };
}

export function savePage(input: PageInput, originalSlug?: string): string {
  if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
  const slug = (input.slug && input.slug.trim()) || slugify(input.title);
  if (!slug) throw new Error("Titre ou slug requis.");
  const fm: Record<string, string> = { title: input.title.trim() };
  if (input.description?.trim()) fm.description = input.description.trim();
  fs.writeFileSync(
    path.join(PAGES_DIR, `${slug}.mdx`),
    matter.stringify(`\n${input.body.trim()}\n`, fm),
    "utf8",
  );
  if (originalSlug && originalSlug !== slug) {
    const old = path.join(PAGES_DIR, `${originalSlug}.mdx`);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }
  return slug;
}

export function deletePage(slug: string): boolean {
  const full = path.join(PAGES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}
