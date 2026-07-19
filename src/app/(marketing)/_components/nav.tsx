"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./brand";

export const NAV_LINKS = [
  { href: "/expertise-comptable", label: "Expertise comptable" },
  { href: "/consulting", label: "Consulting" },
  { href: "/intelligence-artificielle", label: "Intelligence artificielle" },
  { href: "/facturation-electronique", label: "Facturation électronique" },
  { href: "/le-cabinet", label: "Le cabinet" },
  { href: "/blog", label: "Ressources" },
  { href: "/contact", label: "Contact" },
];

// Menu mobile : uniquement les entrées principales.
export const MOBILE_LINKS = [
  { href: "/expertise-comptable", label: "Expertise comptable" },
  { href: "/consulting", label: "Consulting" },
  { href: "/intelligence-artificielle", label: "IA" },
  { href: "/facturation-electronique", label: "Facturation électronique" },
  { href: "/le-cabinet", label: "Le cabinet" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isCur = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className={`mkt-nav${scrolled ? " s" : ""}`}>
        <Link href="/" className="nlogo" aria-label="Trevys — Accueil">
          <BrandMark />
        </Link>
        <ul className="mkt-links">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={isCur(l.href) ? "cur" : ""}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mkt-ncta">
          <Link className="btn btn-sm btn-ghost" href="/app">
            Espace client
          </Link>
          <Link className="btn btn-sm btn-gold" href="/rendez-vous">
            Prendre rendez-vous
          </Link>
          <button
            className="mkt-burger"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
      <div className={`mkt-mobile${open ? " open" : ""}`}>
        <Link
          className="btn btn-lg btn-gold mkt-mobile-cta"
          href="/rendez-vous"
          onClick={() => setOpen(false)}
        >
          Prendre rendez-vous
        </Link>
        {MOBILE_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
