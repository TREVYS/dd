"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  KanbanSquare,
  Inbox,
  FileText,
  Scale,
  BrainCircuit,
  TrendingUp,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  GraduationCap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { canManageCollaborators } from "@/lib/permissions";

const NAV_GROUPS = [
  {
    label: "HUB",
    items: [
      { href: "/", label: "Mon tableau de bord", icon: LayoutDashboard },
      { href: "/academy", label: "Academy TREVYS", icon: GraduationCap },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/pipeline-commercial", label: "Prospects & opportunités", icon: TrendingUp },
      { href: "/tickets", label: "Tickets", icon: Inbox },
      { href: "/devis", label: "Devis", icon: FileText },
    ],
  },
  {
    label: "Production",
    items: [{ href: "/production", label: "Production", icon: KanbanSquare }],
  },
  {
    label: "GED",
    items: [{ href: "/ged", label: "GED", icon: FolderOpen }],
  },
  {
    label: "Knowledge Cabinet",
    items: [{ href: "/knowledge-cabinet", label: "Knowledge Cabinet", icon: BrainCircuit }],
  },
  {
    label: "Assistant Juridique",
    items: [{ href: "/assistant-juridique", label: "Assistant Juridique", icon: Scale }],
  },
  {
    label: "Assistant IA Collaborateur",
    items: [{ href: "/chat", label: "Chat métier", icon: MessageCircle }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-pinned");
    setPinned(stored === "true");
    setMounted(true);
  }, []);

  function togglePinned() {
    const next = !pinned;
    setPinned(next);
    localStorage.setItem("sidebar-pinned", String(next));
  }

  const navGroups = canManageCollaborators(session?.user?.role)
    ? [
        ...NAV_GROUPS,
        {
          label: "Paramétrage",
          items: [{ href: "/parametrage", label: "Paramétrage", icon: Settings }],
        },
      ]
    : NAV_GROUPS;

  const expanded = mounted && (pinned || hovered);
  const initials = (session?.user?.name ?? "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative shrink-0 h-screen" style={{ width: pinned ? 256 : 80 }}>
      <aside
        onMouseEnter={() => !pinned && setHovered(true)}
        onMouseLeave={() => !pinned && setHovered(false)}
        className={`glass-panel border-r h-screen sticky top-0 flex flex-col py-6 rounded-none transition-all duration-200 z-40 ${
          expanded ? "w-64 px-5" : "w-20 px-3"
        } ${!pinned ? "absolute left-0 top-0" : ""}`}
      >
        <div className={`flex items-center gap-2 mb-8 ${expanded ? "" : "justify-center"}`}>
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shadow-lg shadow-brand/30 shrink-0">
            T
          </div>
          {expanded && <span className="text-lg font-semibold flex-1 whitespace-nowrap">TREVYS OS</span>}
          {expanded && (
            <button
              onClick={togglePinned}
              title={pinned ? "Réduire la navigation" : "Épingler la navigation"}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/60 shrink-0"
            >
              {pinned ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden">
          {navGroups.map((group) => (
            <div key={group.label}>
              {expanded && (
                <p className="text-xs font-medium text-gray-400 uppercase mb-2 px-1 whitespace-nowrap">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={expanded ? undefined : item.label}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        expanded ? "" : "justify-center"
                      } ${
                        active
                          ? "bg-brand text-white shadow-md shadow-brand/30"
                          : "text-gray-600 hover:bg-white/60"
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {expanded && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-white/40 pt-4 mt-4 space-y-3`}>
          <div className={`flex items-center gap-2 ${expanded ? "" : "justify-center"}`}>
            <div className="h-9 w-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold shrink-0">
              {initials || "?"}
            </div>
            {expanded && (
              <div className="leading-tight overflow-hidden">
                <p className="text-sm font-medium truncate">{session?.user?.name ?? "Utilisateur"}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.role ?? ""}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={expanded ? undefined : "Déconnexion"}
            className={`flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 ${
              expanded ? "" : "justify-center w-full"
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {expanded && "Déconnexion"}
          </button>
        </div>
      </aside>
    </div>
  );
}
