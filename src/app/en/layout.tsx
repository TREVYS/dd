import type { Metadata } from "next";
import Link from "next/link";
import "../(marketing)/marketing.css";
import { SITE_URL } from "@/lib/site";
import { EnFrLink } from "./en-fr-link";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Trevys Advisory", template: "%s — Trevys Advisory" },
  description:
    "Trevys Advisory — accounting, advisory and AI expertise, based in Paris, serving French and international clients.",
};

// Section anglaise du site, maintenant équipée des pages principales :
// en-tête/pied volontairement distincts du site français (menu propre,
// plus court), le reste (secteurs, équipe détaillée) continue de renvoyer
// vers les pages françaises existantes.
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt">
      <header style={{ borderBottom: "1px solid var(--line)", padding: "1.2rem 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/en" style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)", textDecoration: "none" }}>
            Trevys Advisory
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.1rem", fontSize: ".88rem", flexWrap: "wrap" }}>
            <Link href="/en/accounting-expertise" style={{ color: "var(--ink2)", textDecoration: "none" }}>Accounting</Link>
            <Link href="/en/consulting" style={{ color: "var(--ink2)", textDecoration: "none" }}>Consulting</Link>
            <Link href="/en/ai" style={{ color: "var(--ink2)", textDecoration: "none" }}>AI</Link>
            <Link href="/en/about" style={{ color: "var(--ink2)", textDecoration: "none" }}>About</Link>
            <Link href="/en/blog" style={{ color: "var(--ink2)", textDecoration: "none" }}>Insights</Link>
            <Link href="/en/contact" style={{ color: "var(--ink2)", textDecoration: "none" }}>Contact</Link>
            <Link className="btn btn-sm btn-gold" href="/rendez-vous">Book a meeting</Link>
            <EnFrLink />
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "2rem 0", marginTop: "3rem" }}>
        <div className="wrap" style={{ fontSize: ".85rem", color: "var(--ink3)", display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "space-between", alignItems: "center" }}>
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
