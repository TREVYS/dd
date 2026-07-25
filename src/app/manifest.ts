import type { MetadataRoute } from "next";

// Manifest PWA : permet d'installer le cockpit (et le site) comme une
// application sur mobile — « Ajouter à l'écran d'accueil » sur iPhone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trevys — Cockpit",
    short_name: "Trevys",
    description: "Le cockpit de pilotage du cabinet Trevys : communication, articles, newsletter, recrutement.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f1e9",
    theme_color: "#F5811F",
    icons: [
      { src: "/uploads/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/uploads/logo.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/ts-badge.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
