import fs from "node:fs";
import path from "node:path";

// File de publications réseaux sociaux (brouillons, planifiés, publiés).
// Stockée sur le disque de l'instance : data/social-posts.json.
const FILE = path.join(process.cwd(), "data", "social-posts.json");

export type PostNetwork = "linkedin" | "instagram";
export type PostStatus = "brouillon" | "planifie" | "publie";

export type SocialPost = {
  id: string;
  network: PostNetwork;
  content: string;
  status: PostStatus;
  image?: string; // URL de l'image jointe
  scheduledDate?: string; // AAAA-MM-JJ
  scheduledTime?: string; // HH:MM (heure de Paris) — vide = dès le matin
  deliveredVia?: "telegram"; // relais manuel : transmis sur Telegram pour publication à la main
  liTarget?: "profil" | "page"; // LinkedIn : profil personnel ou Page entreprise
  createdAt: string;
  publishedAt?: string;
  lastTry?: string; // AAAA-MM-JJ — dernière tentative de publication auto
};

function read(): SocialPost[] {
  try {
    if (!fs.existsSync(FILE)) return [];
    const data = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(data) ? data : (data.posts ?? []);
  } catch {
    return [];
  }
}

function write(posts: SocialPost[]) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(posts, null, 2), "utf8");
}

export function listPosts(): SocialPost[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getPost(id: string): SocialPost | undefined {
  return read().find((p) => p.id === id);
}

export function addPost(input: {
  network: PostNetwork;
  content: string;
  status?: PostStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  image?: string;
  liTarget?: "profil" | "page";
}): SocialPost {
  const posts = read();
  const post: SocialPost = {
    id: Math.random().toString(36).slice(2, 10),
    network: input.network,
    content: input.content,
    status: input.status ?? "brouillon",
    image: input.image || undefined,
    scheduledDate: input.scheduledDate || undefined,
    scheduledTime: input.scheduledTime || undefined,
    liTarget: input.liTarget,
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  write(posts);
  return post;
}

export function updatePost(id: string, patch: Partial<SocialPost>): SocialPost | undefined {
  const posts = read();
  const i = posts.findIndex((p) => p.id === id);
  if (i === -1) return undefined;
  posts[i] = { ...posts[i], ...patch };
  write(posts);
  return posts[i];
}

export function deletePost(id: string): boolean {
  const posts = read();
  const next = posts.filter((p) => p.id !== id);
  if (next.length === posts.length) return false;
  write(next);
  return true;
}
