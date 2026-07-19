import type { MetadataRoute } from "next";

const BASE = "https://www.trevys-advisory.fr";

const ROUTES = [
  "",
  "/expertise-comptable",
  "/consulting",
  "/facturation-electronique",
  "/le-cabinet",
  "/notre-ecosysteme",
  "/references",
  "/blog",
  "/contact",
  "/mentions-legales",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
