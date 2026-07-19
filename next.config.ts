import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome : génère .next/standalone (serveur Node minimal + deps
  // strictement nécessaires) pour un déploiement simple sur Gandi / VPS.
  output: "standalone",
};

export default nextConfig;
