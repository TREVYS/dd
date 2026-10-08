import type { Metadata } from "next";
import Link from "next/link";
import "../(marketing)/marketing.css";
import { SITE_URL } from "@/lib/site";
import { Logo } from "../(marketing)/_components/logo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Trevys Advisory", template: "%s — Trevys Advisory" },
  description:
    "Trevys Advisory — accounting, advisory and AI expertise, based in Paris, serving French and international clients.",
};

// Section anglaise du site : une page de présentation + contact, simple et
// fiable. Le reste du site reste en français pour l'instant.
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt">
      <header className="mkt-en-head">
        <div className="wrap mkt-en-head-in">
          <Link href="/en" className="nlogo" aria-label="Trevys Advisory — Home">
            <Logo compactOnMobile />
          </Link>
          <nav className="mkt-en-nav">
            <Link href="/en/blog">Insights</Link>
            <Link className="btn btn-sm btn-gold" href="/rendez-vous">Book a meeting</Link>
            <Link href="/" className="mkt-en-fr">FR 🇫🇷</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mkt-en-foot">
        <div className="wrap">
          © {new Date().getFullYear()} · Trevys Advisory · EURL · 1 rue Le Nôtre, 75016 Paris · SIREN 839 267 804
        </div>
      </footer>
    </div>
  );
}
