import type { Metadata } from "next";
import Link from "next/link";
import "../(marketing)/marketing.css";
import { SITE_URL } from "@/lib/site";
import { Logo } from "../(marketing)/_components/logo";
import { EnFrLink } from "./en-fr-link";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Trevys Advisory", template: "%s — Trevys Advisory" },
  description:
    "Trevys Advisory — accounting, advisory and AI expertise, based in Paris, serving French and international clients.",
};

// Section anglaise du site : en-tête/pied propres (vrai logo, menu complet,
// responsive dès 600px), distincts du site français — pas de duplication
// du menu déroulant complet tant que les pages secteurs/équipe ne sont
// pas traduites.
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt">
      <header className="mkt-en-head">
        <div className="wrap mkt-en-head-in">
          <Link href="/en" className="nlogo" aria-label="Trevys Advisory — Home">
            <Logo compactOnMobile />
          </Link>
          <nav className="mkt-en-nav">
            <Link href="/en/accounting-expertise">Accounting</Link>
            <Link href="/en/consulting">Consulting</Link>
            <Link href="/en/ai">AI</Link>
            <Link href="/en/about">About</Link>
            <Link href="/en/blog">Insights</Link>
            <Link href="/en/contact">Contact</Link>
            <Link className="btn btn-sm btn-gold" href="/rendez-vous">Book a meeting</Link>
            <EnFrLink />
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mkt-en-foot">
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "1.2rem", justifyContent: "center", alignItems: "center" }}>
          <span>© {new Date().getFullYear()} · Trevys Advisory · EURL · 1 rue Le Nôtre, 75016 Paris · SIREN 839 267 804</span>
          <span style={{ display: "flex", gap: "1rem" }}>
            <Link href="/en/organizational-audit" style={{ color: "var(--ink3)", textDecoration: "none" }}>Organizational Audit</Link>
            <Link href="/en/e-invoicing" style={{ color: "var(--ink3)", textDecoration: "none" }}>E-invoicing</Link>
            <Link href="/en/ecosystem" style={{ color: "var(--ink3)", textDecoration: "none" }}>Ecosystem</Link>
            <Link href="/en/references" style={{ color: "var(--ink3)", textDecoration: "none" }}>References</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
