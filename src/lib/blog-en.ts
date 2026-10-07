import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Traductions anglaises des articles du blog (générées par Alfred à la
// rédaction, relues avant publication). Un fichier par slug, même nom que
// la version française — servi sur /en/blog/<slug>.
const BLOG_DIR_EN = path.join(process.cwd(), "content", "blog-en");

export type PostMetaEn = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
};

export function getPostEn(slug: string): { meta: PostMetaEn; content: string } | null {
  const full = path.join(BLOG_DIR_EN, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      image: data.image ? String(data.image) : undefined,
    },
    content,
  };
}

export function hasTranslation(slug: string): boolean {
  return fs.existsSync(path.join(BLOG_DIR_EN, `${slug}.mdx`));
}

export function getAllPostsEn(): PostMetaEn[] {
  if (!fs.existsSync(BLOG_DIR_EN)) return [];
  return fs
    .readdirSync(BLOG_DIR_EN)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR_EN, file), "utf8"));
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        image: data.image ? String(data.image) : undefined,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
