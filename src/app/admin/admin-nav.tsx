"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlfredAvatar } from "./alfred-avatar";
import { Icon } from "./icons";

type Item = { href: string; label: string; ic: string; exact?: boolean; also?: string[] };
type Group = { title: string; items: Item[] };

// Organisation en 4 univers : piloter, communiquer, répondre, gérer le site.
const GROUPS: Group[] = [
  {
    title: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", ic: "home", exact: true },
      { href: "/admin/statistiques", label: "Statistiques", ic: "chart" },
    ],
  },
  {
    title: "Communication",
    items: [
      // « Brouillons » regroupe articles + réseaux sociaux (onglets internes).
      { href: "/admin/communication/calendrier", label: "Brouillons", ic: "draft", also: ["/admin/communication/reseaux", "/admin/communication/mailings"] },
      { href: "/admin/communication/newsletter", label: "Newsletter", ic: "mail" },
      { href: "/admin/communication/routines", label: "Routines d'Alfred", ic: "repeat" },
      { href: "/admin/ged", label: "GED — Documents", ic: "folder" },
    ],
  },
  {
    title: "Boîte de réception",
    items: [
      { href: "/admin/messages", label: "Messages reçus", ic: "inbox" },
      { href: "/admin/recrutement", label: "Recrutement", ic: "users" },
    ],
  },
  {
    title: "Site web",
    items: [
      { href: "/admin/articles", label: "Articles", ic: "news" },
      { href: "/admin/videos", label: "Vidéos", ic: "video" },
      { href: "/admin/medias", label: "Médias", ic: "image" },
      { href: "/admin/legal", label: "Pages légales", ic: "scale" },
    ],
  },
  {
    title: "",
    items: [{ href: "/admin/reglages", label: "Réglages", ic: "gear" }],
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
            const on = l.exact
              ? pathname === l.href
              : pathname.startsWith(l.href) || (l.also ?? []).some((p) => pathname.startsWith(p));
            const badge = badges[l.href] ?? 0;
            return (
              <Link key={l.href} href={l.href} className={on ? "on" : ""}>
                <span className="adm-nav-ic" aria-hidden="true"><Icon name={l.ic} /></span>
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
