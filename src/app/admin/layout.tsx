import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import "./admin.css";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: "Back-office · Trevys",
  robots: { index: false, follow: false },
};

// Seuls ces rôles accèdent au back-office.
const ALLOWED_ROLES = ["Administrateur", "Associé"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string | null }).role ?? "";
  if (!ALLOWED_ROLES.includes(role)) redirect("/app");

  const name = session.user.name ?? session.user.email ?? "Admin";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-brandmark">TA</span> Cockpit <b>Trevys</b>
        </div>
        <AdminNav />
        <div className="sp">
          <Link href="/">← Voir le site</Link>
          <Link href="/app">Aller à l&apos;ERP</Link>
        </div>
      </aside>
      <main className="adm-main">
        <header className="ck-top">
          <div className="ck-search">
            <svg viewBox="0 0 24 24"><path d="M21 21l-4-4M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
            <input placeholder="Rechercher…" aria-label="Rechercher" />
          </div>
          <div className="ck-topuser">
            <span className="av">{initials}</span>
            <span className="nm">{name}</span>
          </div>
        </header>
        <div className="adm-content">{children}</div>
      </main>
    </div>
  );
}
