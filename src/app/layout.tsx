import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trevys — Expertise comptable & conseil",
  description:
    "Cabinet d'expertise comptable & de conseil à Paris, augmenté par la technologie.",
  icons: {
    // Badge TS embarqué avec le site (vectoriel, net à toutes les tailles).
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/brand/ts-badge.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/uploads/logo.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: ["/brand/ts-badge.svg"],
    // iOS n'accepte pas le SVG pour l'écran d'accueil : PNG du badge TS.
    apple: "/uploads/logo.png",
  },
  // Application web installable (PWA) : plein écran sur iPhone une fois
  // ajoutée à l'écran d'accueil.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Trevys",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#F5811F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Première requête après un déploiement : Alfred annonce la mise à jour
  // sur Telegram (une seule fois par build, non bloquant).
  import("@/lib/deploy-notify").then((m) => m.notifyDeployOnce()).catch(() => {});

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
