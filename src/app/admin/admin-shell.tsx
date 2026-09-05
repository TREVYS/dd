"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNav } from "./admin-nav";
import { GlobalSearch } from "./global-search";
import { logoutAction } from "./reglages/actions";

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
    </div>
  );
}
