import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, KanbanSquare, Inbox, FileText } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const [clientCount, openTasks, openTickets, draftQuotes] =
    await Promise.all([
      prisma.client.count({ where: { status: "active" } }),
      prisma.task.count({ where: { status: { not: "done" } } }),
      prisma.ticket.count({ where: { status: { not: "closed" } } }),
      prisma.quote.count({ where: { status: "draft" } }),
    ]);

  const recentTasks = await prisma.task.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { client: true, assignee: true },
  });

  const stats = [
    { label: "Clients actifs", value: clientCount, icon: Users, href: "/clients" },
    { label: "Tâches en cours", value: openTasks, icon: KanbanSquare, href: "/production" },
    { label: "Tickets ouverts", value: openTickets, icon: Inbox, href: "/tickets" },
    { label: "Devis en brouillon", value: draftQuotes, icon: FileText, href: "/devis" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-brand rounded-3xl p-8 text-white relative overflow-hidden">
        <p className="text-sm font-medium opacity-80 mb-2">CABINET TREVYS</p>
        <h1 className="text-3xl font-semibold mb-1">Bonjour {firstName} 👋</h1>
        <p className="opacity-80">
          Voici l&apos;état de votre activité aujourd&apos;hui.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
