import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { TEAM } from "@/lib/team";
import { CONSULTANTS } from "@/lib/consultants";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

const ROUTES = [
  "",
  "/expertise-comptable",
  "/consulting",
  "/intelligence-artificielle",
  "/facturation-electronique",
  "/audit-organisationnel",
  "/le-cabinet",
  "/notre-ecosysteme",
  "/references",
  "/blog",
  "/newsletter",
  "/contact",
  "/rendez-vous",
  // Pages volontairement en « noindex » (mentions légales, désinscription,
  // espace client) : elles ne figurent PAS ici — un sitemap ne doit lister
  // que des pages indexables, sinon la Search Console signale l'incohérence.
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  // Fiches des associés et des consultants.
  const peopleEntries: MetadataRoute.Sitemap = [
    ...TEAM.map((m) => `/le-cabinet/${m.slug}`),
    ...CONSULTANTS.map((c) => `/consulting/${c.slug}`),
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...peopleEntries, ...blogEntries];
}
