import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  KanbanSquare,
  Inbox,
  FileText,
  Landmark,
  AlertTriangle,
  Target,
  Info,
  Mail,
  GraduationCap,
  Calculator,
  Scale,
  Wallet,
} from "lucide-react";
import { NewAnnouncementButton } from "./new-announcement-button";

const CATEGORY_META: Record<string, { label: string; icon: typeof Info; color: string }> = {
  fiscalite: { label: "Fiscalité", icon: Landmark, color: "bg-blue-50 text-blue-600" },
  attention: { label: "Point d'attention", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
  objectif: { label: "Objectif du mois", icon: Target, color: "bg-emerald-50 text-emerald-600" },
  info: { label: "Information", icon: Info, color: "bg-gray-50 text-gray-600" },
};

const LESSONS = [
  {
    title: "Bien calculer la TVA déductible",
    category: "Fiscalité",
    icon: Landmark,
    color: "bg-blue-50 text-blue-600",
    summary: "Les cas particuliers de récupération de TVA sur véhicules et notes de frais.",
  },
  {
    title: "Clôturer un exercice sans stress",
    category: "Comptabilité",
    icon: Calculator,
    color: "bg-emerald-50 text-emerald-600",
    summary: "Checklist du dossier de révision avant édition de la liasse fiscale.",
  },
  {
    title: "Rupture conventionnelle : les pièges",
    category: "Social",
    icon: Wallet,
    color: "bg-amber-50 text-amber-600",
    summary: "Les points de vigilance à vérifier avant signature de la convention.",
  },
  {
    title: "Dépôt des comptes au greffe",
    category: "Juridique",
    icon: Scale,
    color: "bg-violet-50 text-violet-600",
    summary: "Le rappel des délais et pièces à fournir pour le dépôt annuel.",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const userId = session?.user?.id;
  const isPartner = session?.user?.role === "Associé";

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [clientCount, openTasks, openTickets, draftQuotes, mailsToTreat, announcements] =
    await Promise.all([
      prisma.client.count({ where: { status: "active" } }),
      prisma.task.count({ where: { status: { not: "done" } } }),
      prisma.ticket.count({ where: { status: { not: "closed" } } }),
      prisma.quote.count({ where: { status: "draft" } }),
      userId
        ? prisma.mail.count({ where: { recipientId: userId, status: "a_traiter" } })
        : Promise.resolve(0),
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
  const pendingMonthly = totalMonthly - doneMonthly;

  const myTicketsOpen = userId
    ? await prisma.ticket.count({ where: { assignedTo: userId, status: { not: "closed" } } })
    : 0;

  const isUpToDate = totalMonthly === 0 || progressPct >= 80;
  const initials = `${session?.user?.name?.[0] ?? ""}${
    session?.user?.name?.split(" ")[1]?.[0] ?? ""
  }`.toUpperCase();

  const stats = [
    { label: "Clients actifs", value: clientCount, icon: Users, href: "/clients" },
    { label: "Tâches en cours", value: openTasks, icon: KanbanSquare, href: "/production" },
    { label: "Mails à traiter", value: mailsToTreat, icon: Mail, href: "/mails" },
    { label: "Tickets ouverts", value: openTickets, icon: Inbox, href: "/tickets" },
    { label: "Devis en brouillon", value: draftQuotes, icon: FileText, href: "/devis" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-gradient-to-br from-brand via-violet-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide opacity-80 mb-2">
                COMMUNICATIONS DU CABINET
              </p>
              <h1 className="text-3xl font-semibold mb-1">Bonjour {firstName} 👋</h1>
              <p className="opacity-80 max-w-md">
                Actualités fiscales, points d&apos;attention et nouvelles du cabinet, réunis ici.
              </p>
            </div>
            {isPartner && <NewAnnouncementButton />}
          </div>

          {announcements.length > 0 ? (
            <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              {announcements.slice(0, 3).map((a) => {
                const meta = CATEGORY_META[a.category] ?? CATEGORY_META.info;
                const Icon = meta.icon;
                return (
                  <div
                    key={a.id}
                    className="bg-white text-gray-800 rounded-2xl p-4 space-y-1.5 shadow-sm"
                  >
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
                      <Icon size={12} />
                      {meta.label}
                    </div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="relative mt-6 text-sm opacity-70">
              Aucune communication pour le moment.
            </p>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold">
              {initials || "?"}
            </div>
            <div>
              <p className="font-semibold leading-tight">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">{session?.user?.role}</p>
            </div>
          </div>

          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium flex items-center justify-between ${
              isUpToDate ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <span>{isUpToDate ? "À jour" : "En retard"}</span>
            <span>{progressPct}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Link href="/production" className="rounded-xl bg-gray-50 px-2 py-3 hover:bg-gray-100">
              <p className="text-lg font-semibold">{pendingMonthly < 0 ? 0 : pendingMonthly}</p>
              <p className="text-[11px] text-gray-400">Tâches/mois</p>
            </Link>
            <Link href="/mails" className="rounded-xl bg-gray-50 px-2 py-3 hover:bg-gray-100">
              <p className="text-lg font-semibold">{mailsToTreat}</p>
              <p className="text-[11px] text-gray-400">Mails</p>
            </Link>
            <Link href="/tickets" className="rounded-xl bg-gray-50 px-2 py-3 hover:bg-gray-100">
              <p className="text-lg font-semibold">{myTicketsOpen}</p>
              <p className="text-[11px] text-gray-400">Tickets</p>
            </Link>
          </div>
        </div>
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
      </div>

      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <GraduationCap size={18} className="text-brand" />
            Académie TREVYS
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {LESSONS.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.title} className="rounded-2xl border border-gray-100 p-4 space-y-2">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${l.color}`}>
                  <Icon size={12} />
                  {l.category}
                </div>
                <p className="font-semibold text-sm">{l.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{l.summary}</p>
              </div>
            );
          })}
        </div>
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
