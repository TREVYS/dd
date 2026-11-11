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
    // Build Gandi : la génération des pages et les extensions du bundler
    // tournent dans des fils du processus principal plutôt que dans des
    // processus séparés (chaque processus Node coûte une dizaine de fils,
    // et le quota de l'instance est vite atteint : « can't spawn worker thread »).
    ...(process.env.LOW_THREADS_BUILD === "1"
      ? { workerThreads: true, turbopackPluginRuntimeStrategy: "workerThreads" as const }
      : {}),
    // Les candidatures embarquent un CV (jusqu'à 3 Mo) : on relève largement la
    // limite des Server Actions (1 Mo par défaut, qui rejetait silencieusement
    // toute candidature avec un CV un peu lourd). Marge confortable au-delà des
    // 3 Mo du CV pour couvrir le reste du formulaire et l'encodage multipart.
    serverActions: { bodySizeLimit: "8mb" },
  },
  // Librairies Node lourdes chargées à la demande (extraction de documents) :
  // on évite qu'elles soient empaquetées par le bundler (mémoire de build,
  // compatibilité runtime), elles restent lues depuis node_modules.
  // Sur l'hébergement Gandi, l'étape « Running TypeScript » du build manque
  // de threads et plante (pthread_create). Le typage est vérifié avant chaque
  // envoi (tsc --noEmit) : on le saute uniquement pour le build Gandi.
  typescript: { ignoreBuildErrors: process.env.SKIP_BUILD_TYPECHECK === "1" },
  serverExternalPackages: ["pdf-parse", "jszip", "sharp"],
  async redirects() {
    return [{ source: "/audit-it", destination: "/audit-organisationnel#audit-it", permanent: true }];
  },
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
