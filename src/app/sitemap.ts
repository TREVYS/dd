import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { TEAM } from "@/lib/team";
import { CONSULTANTS } from "@/lib/consultants";
import { SITE_URL } from "@/lib/site";
import { LOCAL_PAGES, localPagePath } from "@/lib/local-pages";
import { getAllPostsEn } from "@/lib/blog-en";

const BASE = SITE_URL;

const ROUTES = [
  "",
  "/expertise-comptable",
  "/nos-offres",
  "/consulting",
  "/consulting/expertises/si-finance",
  "/consulting/expertises/erp-amoa",
  "/consulting/expertises/transformation-digitale",
  "/intelligence-artificielle",
  "/facturation-electronique",
  "/audit-organisationnel",
  "/le-cabinet",
  "/notre-ecosysteme",
  "/references",
  "/blog",
  "/newsletter",
  "/simulateurs/remuneration-dirigeant",
  "/simulateurs/dividendes-pfu-bareme",
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

  // Pages « métier + localisation » (accessibles depuis le pied de page).
  const localEntries: MetadataRoute.Sitemap = LOCAL_PAGES.map((p) => ({
    url: `${BASE}${localPagePath(p)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Section anglaise : page d'accueil, index des articles traduits, et
  // chaque article dont la traduction a été publiée.
  const enEntries: MetadataRoute.Sitemap = [
    "/en",
    "/en/accounting-expertise",
    "/en/consulting",
    "/en/ai",
    "/en/e-invoicing",
    "/en/organizational-audit",
    "/en/about",
    "/en/ecosystem",
    "/en/references",
    "/en/contact",
    "/en/blog",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: (path === "/en/blog" ? "weekly" : "monthly") as const,
    priority: path === "/en" ? 0.8 : 0.6,
  })).concat(
    getAllPostsEn().map((post) => ({
      url: `${BASE}/en/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  );

  return [...staticEntries, ...peopleEntries, ...localEntries, ...blogEntries, ...enEntries];
}
