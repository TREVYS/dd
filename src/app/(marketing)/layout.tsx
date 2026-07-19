import type { Metadata } from "next";
import "./marketing.css";
import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.trevys-advisory.fr"),
  title: {
    default: "Trevys — Expertise comptable & conseil",
    template: "%s — Trevys",
  },
  description:
    "Cabinet d'expertise comptable & de conseil à Paris : expertise comptable, consulting, facturation électronique et innovation au service des dirigeants.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Trevys Advisory",
    title: "Trevys — Expertise comptable & conseil",
    description:
      "Cabinet d'expertise comptable & de conseil à Paris : expertise, consulting, facturation électronique et innovation.",
    url: "https://www.trevys-advisory.fr",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AccountingService",
  name: "Trevys Advisory",
  legalName: "T.A. TREVYS ADVISORY",
  url: "https://www.trevys-advisory.fr",
  email: "contact@trevys-advisory.fr",
  telephone: "+33768050465",
  priceRange: "€€€",
  areaServed: "FR",
  address: {
    "@type": "PostalAddress",
    streetAddress: "13 avenue Bugeaud",
    postalCode: "75116",
    addressLocality: "Paris",
    addressCountry: "FR",
  },
  founder: {
    "@type": "Person",
    name: "John Lévy",
    jobTitle: "Fondateur, Expert-comptable",
  },
  vatID: "FR32839267804",
  taxID: "839267804",
  knowsAbout: [
    "Expertise comptable",
    "Audit",
    "Contrôle de gestion",
    "Conseil en transformation",
    "Facturation électronique",
    "Juridique et fiscal",
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mkt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
