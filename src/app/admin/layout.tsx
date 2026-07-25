import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import "./admin.css";
import { AdminShell } from "./admin-shell";
import { unreadCount } from "@/lib/newsletter";
import { unreadMessages } from "@/lib/contact-messages";
import { unreadApplications } from "@/lib/jobs";
import { runDueRoutines } from "@/lib/alfred-routines-run";
import { maybeSendWeeklyStatsReport } from "@/lib/stats-report";

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
  if (!ALLOWED_ROLES.includes(role)) redirect("/");

  // Exécution opportuniste des routines d'Alfred dues (en arrière-plan,
  // sans ralentir l'affichage du cockpit).
  runDueRoutines().catch(() => {});
  // Rapport d'audience hebdomadaire sur Telegram (au plus 1 fois / 7 jours).
  maybeSendWeeklyStatsReport().catch(() => {});

  const name = session.user.name ?? session.user.email ?? "Admin";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const badges = {
    "/admin/communication/newsletter": unreadCount(),
    "/admin/messages": unreadMessages(),
    "/admin/recrutement": unreadApplications(),
  };

  return (
    <AdminShell name={name} initials={initials} badges={badges}>
      {children}
    </AdminShell>
  );
}
