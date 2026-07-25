"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlfredAvatar } from "./alfred-avatar";

type Item = { href: string; label: string; ic: string; exact?: boolean };
type Group = { title: string; items: Item[] };

// Organisation en 4 univers : piloter, communiquer, répondre, gérer le site.
const GROUPS: Group[] = [
  {
    title: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", ic: "🏠", exact: true },
      { href: "/admin/statistiques", label: "Statistiques", ic: "📊" },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/communication/calendrier", label: "Brouillons d'articles", ic: "📝" },
      { href: "/admin/communication/reseaux", label: "Réseaux sociaux", ic: "📣" },
      { href: "/admin/communication/newsletter", label: "Newsletter", ic: "💌" },
      { href: "/admin/communication/routines", label: "Routines d'Alfred", ic: "🔁" },
    ],
  },
  {
    title: "Boîte de réception",
    items: [
      { href: "/admin/messages", label: "Messages reçus", ic: "📬" },
      { href: "/admin/recrutement", label: "Recrutement", ic: "🧑‍💼" },
    ],
  },
  {
    title: "Site web",
    items: [
      { href: "/admin/articles", label: "Articles", ic: "📰" },
      { href: "/admin/videos", label: "Vidéos", ic: "🎬" },
      { href: "/admin/medias", label: "Médias", ic: "🖼️" },
      { href: "/admin/legal", label: "Pages légales", ic: "⚖️" },
    ],
  },
  {
    title: "",
    items: [{ href: "/admin/reglages", label: "Réglages", ic: "⚙️" }],
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
      {GROUPS.map((g, gi) => (
        <div key={g.title || gi}>
          {g.title && <div className="adm-grp">{g.title}</div>}
          {!g.title && <div style={{ height: ".9rem" }} />}
          {g.items.map((l) => {
            const on = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            const badge = badges[l.href] ?? 0;
            return (
              <Link key={l.href} href={l.href} className={on ? "on" : ""}>
                <span className="adm-nav-ic" aria-hidden="true">{l.ic}</span>
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
