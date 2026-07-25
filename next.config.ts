import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  /* Démarrage via server.js (Gandi Simple Hosting) — pas de sortie standalone. */
  // Hébergement mutualisé : on limite le parallélisme de génération des pages
  // (sinon 15 workers → dépassement de ressources / SIGSEGV au build).
  experimental: {
    cpus: 1,
    // Les candidatures embarquent un CV (jusqu'à 3 Mo) : on relève la limite
    // des Server Actions (1 Mo par défaut, qui rejetait silencieusement).
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Librairies Node lourdes chargées à la demande (extraction de documents) :
  // on évite qu'elles soient empaquetées par le bundler (mémoire de build,
  // compatibilité runtime), elles restent lues depuis node_modules.
  serverExternalPackages: ["pdf-parse", "jszip"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Le back-office n'est jamais indexé ni mis en cache.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
