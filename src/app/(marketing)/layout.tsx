import type { Metadata } from "next";
import "./marketing.css";
import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";
import { AnalyticsBeacon } from "./_components/analytics-beacon";
import { WhatsappFab } from "./_components/whatsapp";
import { menuPages } from "@/lib/content-admin";
import { SITE_URL } from "@/lib/site";

const SITE = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Trevys — Expertise comptable & conseil à Paris",
    template: "%s — Trevys",
  },
  description:
    "Cabinet d'expertise comptable & de conseil à Paris : expertise comptable, audit, contrôle de gestion, consulting, facturation électronique et intelligence artificielle au service des dirigeants.",
  applicationName: "Trevys Advisory",
  authors: [{ name: "Trevys Advisory", url: SITE }],
  creator: "Trevys Advisory",
  publisher: "Trevys Advisory",
  category: "Finance",
  keywords: [
    "expertise comptable",
    "expert-comptable Paris",
    "cabinet comptable",
    "audit",
    "contrôle de gestion",
    "conseil en transformation",
    "facturation électronique",
    "réforme facturation électronique",
    "consulting finance",
    "intelligence artificielle comptabilité",
    "Trevys",
  ],
  formatDetection: { telephone: true, email: true, address: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Trevys Advisory",
    title: "Trevys — Expertise comptable & conseil à Paris",
    description:
      "Expertise comptable, audit, contrôle de gestion, consulting, facturation électronique et IA au service des dirigeants.",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Trevys — Expertise comptable & conseil",
    description:
      "Cabinet d'expertise comptable & de conseil à Paris, augmenté par la technologie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AccountingService",
      "@id": `${SITE}/#organization`,
      name: "Trevys Advisory",
      alternateName: "Trevys",
      legalName: "T.A. TREVYS ADVISORY",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/uploads/logo.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE}/opengraph-image-pwu6ef`,
      slogan: "L'expertise du chiffre, la vitesse de la technologie.",
      foundingDate: "2018",
      email: "contact@trevys-advisory.fr",
      telephone: "+33768050465",
      priceRange: "€€€",
      areaServed: "FR",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "19:00",
        },
      ],
      sameAs: [
        "https://www.linkedin.com/company/trevys-advisory/",
        "https://www.youtube.com/watch?v=1-l-g7ElQq8",
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "1 rue Le Nôtre",
        postalCode: "75116",
        addressLocality: "Paris",
        addressCountry: "FR",
      },
      founder: {
        "@type": "Person",
        name: "John Lévy",
        jobTitle: "Fondateur, Expert-comptable",
        url: `${SITE}/le-cabinet/john-levy`,
        sameAs: ["https://www.linkedin.com/in/levyjohn/"],
      },
      vatID: "FR32839267804",
      taxID: "839267804",
      memberOf: {
        "@type": "Organization",
        name: "Ordre des Experts-Comptables Paris Île-de-France",
      },
      knowsAbout: [
        "Expertise comptable",
        "Audit",
        "Contrôle de gestion",
        "Conseil en transformation",
        "Facturation électronique",
        "Juridique et fiscal",
        "Intelligence artificielle",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Trevys Advisory",
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE}/#organization` },
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const extraLinks = menuPages();
  return (
    <div className="mkt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {GA_ID && (
        <>
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
            }}
          />
        </>
      )}
      <Nav extraLinks={extraLinks} />
      {children}
      <Footer />
      <WhatsappFab />
      <AnalyticsBeacon />
    </div>
  );
}
