"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; exact?: boolean; soon?: boolean };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Site web",
    items: [
      { href: "/admin", label: "Tableau de bord", exact: true },
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/legal", label: "Pages légales" },
      { href: "/admin/medias", label: "Médias" },
      { href: "/admin/statistiques", label: "Statistiques" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/communication", label: "Alfred", exact: true },
      { href: "/admin/communication/alfred", label: "Éduquer Alfred" },
      { href: "/admin/communication/calendrier", label: "Calendrier éditorial" },
      { href: "#", label: "Réseaux sociaux", soon: true },
      { href: "#", label: "Newsletter", soon: true },
    ],
  },
  {
    title: "Général",
    items: [{ href: "/admin/reglages", label: "Réglages" }],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column" }}>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="adm-grp">{g.title}</div>
          {g.items.map((l) => {
            if (l.soon) {
              return (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a key={l.label} className="dis">
                  {l.label}
                  <span className="adm-soon">Bientôt</span>
                </a>
              );
            }
            const on = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={on ? "on" : ""}>
                {l.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
