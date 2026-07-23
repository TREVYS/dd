"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlfredAvatar } from "./alfred-avatar";

type Item = { href: string; label: string; exact?: boolean; soon?: boolean };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Communication",
    items: [
      { href: "/admin/communication/alfred", label: "Éduquer Alfred" },
      { href: "/admin/communication/calendrier", label: "Calendrier éditorial" },
      { href: "/admin/communication/reseaux", label: "Réseaux sociaux" },
      { href: "/admin/communication/newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Site web",
    items: [
      { href: "/admin", label: "Tableau de bord", exact: true },
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/videos", label: "Vidéos" },
      { href: "/admin/pages", label: "Pages" },
      { href: "/admin/legal", label: "Pages légales" },
      { href: "/admin/medias", label: "Médias" },
      { href: "/admin/statistiques", label: "Statistiques" },
    ],
  },
  {
    title: "Général",
    items: [{ href: "/admin/reglages", label: "Réglages" }],
  },
];

export function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const alfredOn = pathname === "/admin/communication";
  return (
    <nav style={{ display: "flex", flexDirection: "column" }}>
      <Link href="/admin/communication" className={`adm-alfred${alfredOn ? " on" : ""}`}>
        <span className="adm-alfred-av">
          <AlfredAvatar />
        </span>
        <span className="adm-alfred-tx">
          <b>Alfred</b>
          <small>Directeur de communication</small>
        </span>
        <span className="adm-alfred-dot" />
      </Link>
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
            const badge = badges[l.href] ?? 0;
            return (
              <Link key={l.href} href={l.href} className={on ? "on" : ""}>
                {l.label}
                {badge > 0 && <span className="adm-badge">{badge}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
