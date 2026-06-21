import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./kanban-board";

const COLUMNS = [
  { key: "a_faire", label: "À faire", status: "todo" },
  { key: "en_cours", label: "En cours", status: "in_progress" },
  { key: "controle", label: "Contrôle manager", status: "review" },
  { key: "termine", label: "Terminé", status: "done" },
];

const BOARDS = [
  { key: "gestion_mensuelle", label: "Gestion mensuelle" },
  { key: "cloture_annuelle", label: "Clôture annuelle" },
  { key: "juridique", label: "Production juridique" },
];

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  const sp = await searchParams;
  const board = BOARDS.find((b) => b.key === sp.board)?.key ?? BOARDS[0].key;

  const [tasks, clients, users] = await Promise.all([
    prisma.task.findMany({
      where: { taskType: board },
      include: {
        client: true,
        assignee: true,
        subtasks: { orderBy: { orderIndex: "asc" } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    }),
    prisma.client.findMany({ orderBy: { legalName: "asc" }, select: { id: true, legalName: true } }),
    prisma.user.findMany({
      where: { status: "active" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Production — Kanban</h1>

      <div className="flex gap-2 border-b border-gray-100">
        {BOARDS.map((b) => (
          <Link
            key={b.key}
            href={`/production?board=${b.key}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              board === b.key
                ? "bg-white border border-gray-100 border-b-0 text-brand"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {b.label}
          </Link>
        ))}
      </div>

      <KanbanBoard
        board={board}
        columns={COLUMNS}
        clients={clients.map((c) => ({ id: c.id, name: c.legalName }))}
        users={users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` }))}
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          clientName: t.client.legalName,
          assigneeId: t.assignedTo,
          assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : null,
          priority: t.priority,
          kanbanColumn: t.kanbanColumn ?? "a_faire",
          status: t.status,
          orderIndex: t.orderIndex,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          tags: t.tags,
          subtasks: t.subtasks.map((s) => ({ id: s.id, title: s.title, isDone: s.isDone })),
          comments: t.comments.map((c) => ({
            id: c.id,
            body: c.body,
            authorName: c.author ? `${c.author.firstName} ${c.author.lastName}` : "Utilisateur",
            createdAt: c.createdAt.toISOString(),
          })),
        }))}
      />
    </div>
  );
}
