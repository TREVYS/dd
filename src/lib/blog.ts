import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  category: string;
  excerpt: string;
  author?: string;
};

function readFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
}

export function getAllPosts(): PostMeta[] {
  return readFiles()
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        category: String(data.category ?? "Article"),
        excerpt: String(data.excerpt ?? ""),
        author: data.author ? String(data.author) : undefined,
      } satisfies PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostSlugs(): string[] {
  return readFiles().map((f) => f.replace(/\.mdx$/, ""));
}

export function getPost(slug: string): { meta: PostMeta; content: string } | null {
  const full = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      category: String(data.category ?? "Article"),
      excerpt: String(data.excerpt ?? ""),
      author: data.author ? String(data.author) : undefined,
    },
    content,
  };
}

export function formatDateFr(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
