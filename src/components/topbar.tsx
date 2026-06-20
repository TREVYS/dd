"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, KanbanSquare, Mail, Inbox } from "lucide-react";

type Notifications = {
  tasksToday: { id: string; title: string }[];
  mailsToTreat: { id: string; subject: string }[];
  ticketsToTreat: { id: string; subject: string }[];
};

export function Topbar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Notifications | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const total =
    (data?.tasksToday.length ?? 0) +
    (data?.mailsToTreat.length ?? 0) +
    (data?.ticketsToTreat.length ?? 0);

  return (
    <header className="flex items-center justify-end gap-4 px-8 py-4 border-b border-gray-100 bg-white">
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative h-9 w-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100"
        >
          <Bell size={18} />
          {total > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
              {total}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-50 space-y-3">
            <NotifSection
              icon={KanbanSquare}
              title="Tâches du jour"
              items={data?.tasksToday.map((t) => ({ id: t.id, label: t.title })) ?? []}
              emptyLabel="Aucune tâche due aujourd'hui"
              href="/production"
            />
            <NotifSection
              icon={Mail}
              title="Mails à traiter"
              items={data?.mailsToTreat.map((m) => ({ id: m.id, label: m.subject })) ?? []}
              emptyLabel="Aucun mail à traiter"
              href="/mails"
            />
            <NotifSection
              icon={Inbox}
              title="Tickets à traiter"
              items={data?.ticketsToTreat.map((t) => ({ id: t.id, label: t.subject, href: `/tickets/${t.id}` })) ?? []}
              emptyLabel="Aucun ticket à traiter"
              href="/tickets"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
          {initials || "?"}
        </div>
        <div className="leading-tight">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-400">{userRole ?? "Utilisateur"}</p>
        </div>
      </div>
    </header>
  );
}

function NotifSection({
  icon: Icon,
  title,
  items,
  emptyLabel,
  href,
}: {
  icon: typeof Bell;
  title: string;
  items: { id: string; label: string; href?: string }[];
  emptyLabel: string;
  href: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1.5">
        <Icon size={13} />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 px-1">{emptyLabel}</p>
      ) : (
        <div className="space-y-1">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={item.href ?? href}
              className="block text-sm text-gray-700 hover:bg-gray-50 rounded-lg px-2 py-1.5 truncate"
            >
              {item.label}
            </Link>
          ))}
          {items.length > 4 && (
            <Link href={href} className="block text-xs text-brand px-2">
              Voir tout ({items.length})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
