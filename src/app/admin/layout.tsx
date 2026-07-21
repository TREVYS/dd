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

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          T.A. <b>TREVYS</b>
        </div>
        <AdminNav />
        <div className="sp">
          <div style={{ padding: "0 .8rem .4rem" }}>{session.user.name ?? session.user.email}</div>
          <Link href="/">← Voir le site</Link>
          <Link href="/app">Aller à l&apos;ERP</Link>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
