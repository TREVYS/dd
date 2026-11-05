"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNav } from "./admin-nav";
import { GlobalSearch } from "./global-search";
import { logoutAction } from "./reglages/actions";
import { Icon } from "./icons";
import { AlfredAvatar } from "./alfred-avatar";

// Barre de navigation mobile (façon application) : 4 raccourcis + Alfred au centre.
const TABS = [
  { href: "/admin", label: "Accueil", ic: "home", exact: true },
  { href: "/admin/communication/calendrier", label: "Brouillons", ic: "draft", also: ["/admin/communication/reseaux", "/admin/communication/mailings"] },
  { href: "/admin/communication/newsletter", label: "Newsletter", ic: "mail" },
  { href: "/admin/messages", label: "Messages", ic: "inbox" },
];
const ALFRED_HREF = "/admin/communication";

// Coquille du cockpit avec navigation en tiroir (off-canvas) sur mobile.
export function AdminShell({
  name,
  initials,
  badges,
  children,
}: {
  name: string;
  initials: string;
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fermer le tiroir à chaque changement de page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquer le défilement du fond quand le tiroir est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dockLink = (t: (typeof TABS)[number]) => {
    const on = t.exact
      ? pathname === t.href
      : pathname.startsWith(t.href) || (t.also ?? []).some((p) => pathname.startsWith(p));
    const badge = badges?.[t.href] ?? 0;
    return (
      <Link key={t.href} href={t.href} className={`ck-dock-tab${on ? " on" : ""}`} aria-current={on ? "page" : undefined}>
        <span className="ic">
          <Icon name={t.ic} size={21} />
          {badge > 0 && <span className="bd">{badge > 9 ? "9+" : badge}</span>}
        </span>
        <span className="lb">{t.label}</span>
      </Link>
    );
  };

  return (
    <div className={`adm${open ? " nav-open" : ""}`}>
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-brandmark">TA</span> Cockpit <b>Trevys</b>
        </div>
        <AdminNav badges={badges} />
        <div className="sp">
          <Link href="/">← Voir le site</Link>
          <form action={logoutAction}>
            <button type="submit" className="adm-logout">Se déconnecter</button>
          </form>
        </div>
      </aside>

      <div className="adm-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />

      <main className="adm-main">
        <header className="ck-top">
          <button
            className="adm-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <GlobalSearch />
          <div className="ck-topuser">
            <span className="av">{initials}</span>
            <span className="nm">{name}</span>
          </div>
        </header>
        <div className="adm-content">{children}</div>
      </main>

      {/* Masquée sur la conversation avec Alfred : sa barre de saisie occupe le bas de l'écran. */}
      {pathname !== ALFRED_HREF && (
        <nav className="ck-dock" aria-label="Navigation rapide">
          {TABS.slice(0, 2).map((t) => dockLink(t))}
          <Link href={ALFRED_HREF} className="ck-dock-alfred" aria-label="Parler à Alfred">
            <span className="ck-dock-alfred-av"><AlfredAvatar /></span>
            <span className="lb">Alfred</span>
          </Link>
          {TABS.slice(2).map((t) => dockLink(t))}
        </nav>
      )}
    </div>
  );
}
