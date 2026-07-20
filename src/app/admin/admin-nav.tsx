"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/medias", label: "Médias" },
  { href: "/admin/statistiques", label: "Statistiques" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
      {LINKS.map((l) => {
        const on = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={on ? "on" : ""}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
