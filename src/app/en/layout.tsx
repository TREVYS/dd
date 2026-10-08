import type { Metadata } from "next";
import Link from "next/link";
import "../(marketing)/marketing.css";
import { SITE_URL } from "@/lib/site";

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
      <header style={{ borderBottom: "1px solid var(--line)", padding: "1.2rem 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <Link href="/en" style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)", textDecoration: "none" }}>
            Trevys Advisory
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "1.2rem", fontSize: ".92rem" }}>
            <Link href="/en/blog" style={{ color: "var(--ink2)", textDecoration: "none" }}>Insights</Link>
            <Link className="btn btn-sm btn-gold" href="/rendez-vous">Book a meeting</Link>
            <Link href="/" style={{ color: "var(--ink3)", textDecoration: "none", fontSize: ".85rem" }}>FR 🇫🇷</Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ borderTop: "1px solid var(--line)", padding: "2rem 0", marginTop: "3rem" }}>
        <div className="wrap" style={{ fontSize: ".85rem", color: "var(--ink3)" }}>
          © {new Date().getFullYear()} · Trevys Advisory · EURL · 1 rue Le Nôtre, 75016 Paris · SIREN 839 267 804
        </div>
      </footer>
    </div>
  );
}
