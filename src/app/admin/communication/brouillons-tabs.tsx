"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Module « Brouillons » : deux volets — articles et réseaux sociaux —
// navigables comme les onglets des Réglages.
const TABS = [
  { href: "/admin/communication/calendrier", label: "Articles" },
  { href: "/admin/communication/reseaux", label: "Réseaux sociaux" },
];

export function BrouillonsTabs() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.3rem" }}>
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className={active ? "adm-btn sm" : "adm-btn ghost sm"}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
