"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const EXPERTISES = [
  { href: "/expertise-comptable", label: "Expertise comptable" },
  { href: "/consulting", label: "Consulting" },
  { href: "/intelligence-artificielle", label: "Intelligence artificielle" },
  { href: "/facturation-electronique", label: "Facturation électronique" },
];

// Liens de premier niveau (hors groupe « Expertises »).
const PRIMARY = [
  { href: "/le-cabinet", label: "Le cabinet" },
  { href: "/blog", label: "Ressources" },
  { href: "/contact", label: "Contact" },
];

// Menu mobile : uniquement les entrées principales.
const MOBILE_LINKS = [
  { href: "/le-cabinet", label: "Le cabinet" },
  { href: "/expertise-comptable", label: "Expertise comptable" },
  { href: "/consulting", label: "Consulting" },
  { href: "/intelligence-artificielle", label: "Intelligence artificielle" },
  { href: "/facturation-electronique", label: "Facturation électronique" },
  { href: "/blog", label: "Ressources" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloquer le défilement de la page derrière le menu mobile ouvert.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Fermer le dropdown au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!dropOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDropOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropOpen]);

  const isCur = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const expertiseActive = EXPERTISES.some((e) => isCur(e.href));

  return (
    <>
      <nav className={`mkt-nav${scrolled ? " s" : ""}${mobileOpen ? " open" : ""}`}>
        <Link href="/" className="nlogo" aria-label="Trevys — Accueil">
          <Logo />
        </Link>

        <ul className="mkt-links">
          <li
            ref={dropRef}
            className={`mkt-has-drop${dropOpen ? " open" : ""}`}
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              type="button"
              className={`mkt-drop-trigger${expertiseActive ? " cur" : ""}`}
              aria-expanded={dropOpen}
              aria-haspopup="true"
              onClick={() => setDropOpen((v) => !v)}
            >
              Expertises
              <svg viewBox="0 0 10 10" className="mkt-caret" aria-hidden="true">
                <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <div className="mkt-drop">
              {EXPERTISES.map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className={isCur(e.href) ? "cur" : ""}
                  onClick={() => setDropOpen(false)}
                >
                  {e.label}
                </Link>
              ))}
            </div>
          </li>
          {PRIMARY.map((l) => (
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
          <Link className="btn btn-sm btn-gold mkt-ncta-rdv" href="/rendez-vous">
            Prendre rendez-vous
          </Link>
          <a
            className="btn btn-sm btn-gold mkt-ncta-guide"
            href="https://forms.cloud.microsoft/e/mr63uL9LsU"
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger le guide RFE
          </a>
          <button
            className="mkt-burger"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        className={`mkt-mobile${mobileOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!mobileOpen}
      >
        {MOBILE_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileOpen(false)}
            className={isCur(l.href) ? "cur" : ""}
          >
            {l.label}
          </Link>
        ))}
        <Link
          className="btn btn-lg btn-gold mkt-mobile-cta"
          href="/rendez-vous"
          onClick={() => setMobileOpen(false)}
        >
          Prendre rendez-vous
        </Link>
        <a className="mkt-mobile-mail" href="mailto:contact@trevys-advisory.fr">
          contact@trevys-advisory.fr
        </a>
      </div>
    </>
  );
}
