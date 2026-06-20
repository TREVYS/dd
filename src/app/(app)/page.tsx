import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, KanbanSquare, Inbox, FileText, Landmark, AlertTriangle, Target, Info } from "lucide-react";
import { NewAnnouncementButton } from "./new-announcement-button";

const CATEGORY_META: Record<string, { label: string; icon: typeof Info; color: string }> = {
  fiscalite: { label: "Fiscalité", icon: Landmark, color: "bg-blue-50 text-blue-600" },
  attention: { label: "Point d'attention", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
  objectif: { label: "Objectif du mois", icon: Target, color: "bg-emerald-50 text-emerald-600" },
  info: { label: "Information", icon: Info, color: "bg-gray-50 text-gray-600" },
};

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const userId = session?.user?.id;
  const isPartner = session?.user?.role === "Associé";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [clientCount, openTasks, openTickets, draftQuotes, announcements] =
    await Promise.all([
      prisma.client.count({ where: { status: "active" } }),
      prisma.task.count({ where: { status: { not: "done" } } }),
      prisma.ticket.count({ where: { status: { not: "closed" } } }),
      prisma.quote.count({ where: { status: "draft" } }),
      prisma.announcement.findMany({
        where: { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const recentTasks = await prisma.task.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, assignee: true },
  });

  let monthlyTasks: { status: string }[] = [];
  if (userId) {
    monthlyTasks = await prisma.task.findMany({
      where: {
        assignedTo: userId,
        createdAt: { gte: startOfMonth, lt: startOfNextMonth },
      },
      select: { status: true },
    });
  }
  const totalMonthly = monthlyTasks.length;
  const doneMonthly = monthlyTasks.filter((t) => t.status === "done").length;
  const progressPct = totalMonthly > 0 ? Math.round((doneMonthly / totalMonthly) * 100) : 0;

  const stats = [
    { label: "Clients actifs", value: clientCount, icon: Users, href: "/clients" },
    { label: "Tâches en cours", value: openTasks, icon: KanbanSquare, href: "/production" },
    { label: "Tickets ouverts", value: openTickets, icon: Inbox, href: "/tickets" },
    { label: "Devis en brouillon", value: draftQuotes, icon: FileText, href: "/devis" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-brand rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-80 mb-2">CABINET TREVYS</p>
            <h1 className="text-3xl font-semibold mb-1">Bonjour {firstName} 👋</h1>
            <p className="opacity-80">
              Voici l&apos;état de votre activité aujourd&apos;hui.
            </p>
          </div>
          {isPartner && <NewAnnouncementButton />}
        </div>

        {announcements.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {announcements.slice(0, 3).map((a) => {
              const meta = CATEGORY_META[a.category] ?? CATEGORY_META.info;
              const Icon = meta.icon;
              return (
                <div
                  key={a.id}
                  className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                    <Icon size={14} />
                    {meta.label}
                  </div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs opacity-80 line-clamp-2">{a.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3">
                <Icon size={20} />
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </Link>
          );
        })}

        {!isPartner && (
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <div className="relative h-16 w-16 mb-2">
              <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f0fd" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#6d5bf6"
                  strokeWidth="4"
                  strokeDasharray={`${(progressPct / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                {progressPct}%
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {doneMonthly}/{totalMonthly} dossiers ce mois-ci
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Tâches récentes</h2>
          <Link href="/production" className="text-sm text-brand">
            Voir tout
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2">Tâche</th>
              <th className="py-2">Client</th>
              <th className="py-2">Collaborateur</th>
              <th className="py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recentTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-50">
                <td className="py-3 font-medium">{task.title}</td>
                <td className="py-3 text-gray-500">{task.client.legalName}</td>
                <td className="py-3 text-gray-500">
                  {task.assignee
                    ? `${task.assignee.firstName} ${task.assignee.lastName}`
                    : "—"}
                </td>
                <td className="py-3">
                  <span className="rounded-full bg-brand/10 text-brand text-xs font-medium px-3 py-1">
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
