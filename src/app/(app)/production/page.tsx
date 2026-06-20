import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./kanban-board";

const COLUMNS = [
  { key: "a_faire", label: "À faire", status: "todo" },
  { key: "en_cours", label: "En cours", status: "in_progress" },
  { key: "controle", label: "Contrôle manager", status: "review" },
  { key: "termine", label: "Terminé", status: "done" },
];

export default async function ProductionPage() {
  const tasks = await prisma.task.findMany({
    include: { client: true, assignee: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Production — Kanban</h1>
      <KanbanBoard
        columns={COLUMNS}
        tasks={tasks.map((t) => ({
          id: t.id,
          title: t.title,
          clientName: t.client.legalName,
          assigneeName: t.assignee
            ? `${t.assignee.firstName} ${t.assignee.lastName}`
            : null,
          priority: t.priority,
          kanbanColumn: t.kanbanColumn ?? "a_faire",
          status: t.status,
        }))}
      />
    </div>
  );
}
