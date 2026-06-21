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
  Gauge,
  Scale,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/ged", label: "GED", icon: FolderOpen },
  { href: "/production", label: "Production", icon: KanbanSquare },
  { href: "/assistant-juridique", label: "Assistant Juridique", icon: Scale },
  { href: "/tickets", label: "Tickets", icon: Inbox },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/charge", label: "Plan de charge", icon: Gauge },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col px-5 py-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold">
          T
        </div>
        <span className="text-lg font-semibold">TREVYS OS</span>
      </div>

      <p className="text-xs font-medium text-gray-400 uppercase mb-3">
        Navigation
      </p>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
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
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
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
