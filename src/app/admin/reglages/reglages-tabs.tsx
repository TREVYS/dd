"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Sous-catégories des Réglages : navigation rapide entre les volets.
const TABS = [
  { href: "/admin/reglages", label: "Clés & connexions" },
  { href: "/admin/reglages/alfred", label: "Éduquer Alfred" },
  { href: "/admin/reglages/securite", label: "Sécurité" },
];

export function ReglagesTabs() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.3rem" }}>
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={active ? "adm-btn sm" : "adm-btn ghost sm"}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
