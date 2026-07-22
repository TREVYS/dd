"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const EXPERTISES = [
  { href: "/expertise-comptable", label: "Expertise comptable", d: "Tenue, révision, bilan augmenté" },
  { href: "/consulting", label: "Consulting", d: "Pilotage, valorisation, stratégie" },
  { href: "/intelligence-artificielle", label: "Intelligence artificielle", d: "Automatisation & agents métier" },
  { href: "/facturation-electronique", label: "Facturation électronique", d: "Mise en conformité 2026" },
];

const CABINET = [
  { href: "/le-cabinet", label: "À propos", d: "La maison Trevys" },
  { href: "/notre-ecosysteme", label: "Notre écosystème", d: "Nos partenaires & le groupe" },
  { href: "/references", label: "Références", d: "Ils nous font confiance" },
];

// Liens de premier niveau (hors groupes déroulants).
// « Contact » est retiré du menu PC : « Prendre rendez-vous » joue ce rôle.
const PRIMARY = [
  { href: "/blog", label: "Ressources" },
];

// Menu mobile : nos deux métiers en tête, puis le reste.
const MOBILE_LINKS = [
  { href: "/expertise-comptable", label: "Expertise comptable" },
  { href: "/consulting", label: "Conseil" },
  { href: "/intelligence-artificielle", label: "Intelligence artificielle" },
  { href: "/facturation-electronique", label: "Facturation électronique" },
  { href: "/le-cabinet", label: "Le cabinet" },
  { href: "/notre-ecosysteme", label: "Notre écosystème" },
  { href: "/references", label: "Références" },
  { href: "/blog", label: "Ressources" },
];

type NavLink = { href: string; label: string };
type DropItem = { href: string; label: string; d: string };

export function Nav({ extraLinks = [] }: { extraLinks?: NavLink[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const dropsRef = useRef<HTMLUListElement>(null);

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

  // Fermer les dropdowns au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!openDrop) return;
    const onDoc = (e: MouseEvent) => {
      if (dropsRef.current && !dropsRef.current.contains(e.target as Node)) {
        setOpenDrop(null);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenDrop(null);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDrop]);

  const isCur = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderDrop = (id: string, label: string, items: DropItem[]) => {
    const open = openDrop === id;
    const active = items.some((i) => isCur(i.href));
    return (
      <li
        className={`mkt-has-drop${open ? " open" : ""}`}
        onMouseEnter={() => setOpenDrop(id)}
        onMouseLeave={() => setOpenDrop((v) => (v === id ? null : v))}
      >
        <button
          type="button"
          className={`mkt-drop-trigger${active ? " cur" : ""}`}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpenDrop((v) => (v === id ? null : id))}
        >
          {label}
          <svg viewBox="0 0 10 10" className="mkt-caret" aria-hidden="true">
            <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <div className="mkt-drop">
          {items.map((i) => (
            <Link
              key={i.label}
              href={i.href}
              className={isCur(i.href) ? "cur" : ""}
              onClick={() => setOpenDrop(null)}
            >
              <span className="dt">{i.label}</span>
              <span className="dd">{i.d}</span>
            </Link>
          ))}
        </div>
      </li>
    );
  };

  return (
    <>
      <nav className={`mkt-nav${scrolled ? " s" : ""}${mobileOpen ? " open" : ""}`}>
        <Link href="/" className="nlogo" aria-label="Trevys — Accueil">
          <Logo />
        </Link>

        <ul className="mkt-links" ref={dropsRef}>
          {renderDrop("cabinet", "Le cabinet", CABINET)}
          {renderDrop("expertises", "Expertises", EXPERTISES)}
          {[...PRIMARY, ...extraLinks].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={isCur(l.href) ? "cur" : ""}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mkt-ncta">
          <Link className="btn btn-sm btn-ghost" href="/espace-client">
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
            Guide RFE
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
        {[...MOBILE_LINKS, ...extraLinks].map((l) => (
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
