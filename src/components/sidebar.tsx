"use client";

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
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_GROUPS = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Assistant",
    items: [
      { href: "/knowledge-cabinet", label: "Knowledge Cabinet", icon: BrainCircuit },
      { href: "/assistant-juridique", label: "Assistant Juridique", icon: Scale },
    ],
  },
  {
    label: "Clients",
    items: [
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/pipeline-commercial", label: "Pipeline commercial", icon: TrendingUp },
      { href: "/tickets", label: "Tickets", icon: Inbox },
      { href: "/devis", label: "Devis", icon: FileText },
    ],
  },
  {
    label: "Production",
    items: [
      { href: "/production", label: "Production", icon: KanbanSquare },
      { href: "/ged", label: "GED", icon: FolderOpen },
      { href: "/chat", label: "Chat interne", icon: MessageCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 glass-panel border-r h-screen sticky top-0 flex flex-col px-5 py-6 rounded-none">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shadow-lg shadow-brand/30">
          T
        </div>
        <span className="text-lg font-semibold">TREVYS OS</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium text-gray-400 uppercase mb-2 px-1">
              {group.label}
            </p>
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
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-brand text-white shadow-md shadow-brand/30"
                        : "text-gray-600 hover:bg-white/60"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/40 pt-4 mt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
