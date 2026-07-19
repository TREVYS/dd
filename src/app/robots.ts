import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/api/", "/login", "/fec-partage"],
    },
    sitemap: "https://www.trevys-advisory.fr/sitemap.xml",
    host: "https://www.trevys-advisory.fr",
  };
}
