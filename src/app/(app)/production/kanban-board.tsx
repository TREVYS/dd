"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckSquare, MessageSquare, X, Search, CalendarClock } from "lucide-react";
import { TaskDetailModal } from "./task-detail-modal";

type Task = {
  id: string;
  title: string;
  description: string | null;
  clientName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  priority: string;
  kanbanColumn: string;
  status: string;
  orderIndex: number;
  dueDate: string | null;
  tags: string[];
  subtasks: { id: string; title: string; isDone: boolean }[];
  comments: { id: string; body: string; authorName: string; createdAt: string }[];
};

type Column = { key: string; label: string; status: string };
type Person = { id: string; name: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function dueBadge(dueDate: string | null) {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  let style = "bg-gray-100 text-gray-500";
  if (diffDays < 0) style = "bg-red-50 text-red-500";
  else if (diffDays <= 2) style = "bg-amber-50 text-amber-600";
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${style}`}>
      <CalendarClock size={11} />
      {label}
    </span>
  );
}

export function KanbanBoard({
  board,
  columns,
  tasks,
  clients,
  users,
}: {
  board: string;
  columns: Column[];
  tasks: Task[];
  clients: Person[];
  users: Person[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState(clients[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return t.title.toLowerCase().includes(q) || t.clientName.toLowerCase().includes(q);
    });
  }, [items, search, assigneeFilter]);

  function reorderWithinColumn(colKey: string, status: string, orderedIds: string[]) {
    setItems((prev) =>
      prev.map((t) => {
        const idx = orderedIds.indexOf(t.id);
        if (idx === -1) return t;
        return { ...t, kanbanColumn: colKey, status, orderIndex: idx };
      })
    );
    const moves = orderedIds.map((id, idx) => ({ id, kanbanColumn: colKey, status, orderIndex: idx }));
    fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves }),
    }).then(() => router.refresh());
  }

  function dropOnColumn(col: Column) {
    if (!dragId) return;
    const colTasks = items
      .filter((t) => t.kanbanColumn === col.key && t.id !== dragId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const orderedIds = [...colTasks.map((t) => t.id), dragId];
    reorderWithinColumn(col.key, col.status, orderedIds);
    setDragId(null);
  }

  function dropOnCard(col: Column, targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const colTasks = items
      .filter((t) => t.kanbanColumn === col.key && t.id !== dragId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const targetIdx = colTasks.findIndex((t) => t.id === targetId);
    const orderedIds = colTasks.map((t) => t.id);
    orderedIds.splice(targetIdx === -1 ? orderedIds.length : targetIdx, 0, dragId);
    reorderWithinColumn(col.key, col.status, orderedIds);
    setDragId(null);
  }

  async function createTask(column: Column) {
    if (!newTitle.trim() || !newClientId) return;
    const colTasks = items.filter((t) => t.kanbanColumn === column.key);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: newClientId,
        title: newTitle.trim(),
        taskType: board,
        kanbanColumn: column.key,
        status: column.status,
      }),
    });
    const created = await res.json();
    setItems((prev) => [
      {
        id: created.id,
        title: created.title,
        description: created.description ?? null,
        clientName: created.client.legalName,
        assigneeId: null,
        assigneeName: null,
        priority: created.priority,
        kanbanColumn: created.kanbanColumn,
        status: created.status,
        orderIndex: colTasks.length,
        dueDate: null,
        tags: [],
        subtasks: [],
        comments: [],
      },
      ...prev,
    ]);
    setNewTitle("");
    setAddingColumn(null);
    router.refresh();
  }

  const activeTask = items.find((t) => t.id === activeTaskId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une carte..."
            className="w-full rounded-xl border border-gray-200 pl-8 pr-3 py-2 text-sm"
          />
        </div>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Tous les assignés</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => {
          const colTasks = filtered
            .filter((t) => t.kanbanColumn === col.key)
            .sort((a, b) => a.orderIndex - b.orderIndex);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOnColumn(col)}
              className="bg-gray-50 rounded-2xl p-3 min-h-[300px] w-72 shrink-0"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <span className="text-xs text-gray-400">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const doneCount = task.subtasks.filter((s) => s.isDone).length;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.stopPropagation();
                        dropOnCard(col, task.id);
                      }}
                      onClick={() => setActiveTaskId(task.id)}
                      className="glass-panel rounded-xl p-3 shadow-sm cursor-grab space-y-2"
                    >
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((t) => (
                            <span
                              key={t}
                              className="bg-brand/10 text-brand text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.clientName}</p>

                      {task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 bg-gray-100 rounded-full flex-1 overflow-hidden">
                            <div
                              className="h-full bg-brand"
                              style={{ width: `${(doneCount / task.subtasks.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {doneCount}/{task.subtasks.length}
                          </span>
                        </div>
                      )}

                      {task.dueDate && <div>{dueBadge(task.dueDate)}</div>}

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-gray-400">
                          {task.subtasks.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px]">
                              <CheckSquare size={12} />
                              {doneCount}/{task.subtasks.length}
                            </span>
                          )}
                          {task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px]">
                              <MessageSquare size={12} />
                              {task.comments.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-50 text-red-500"
                                : "bg-brand/10 text-brand"
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.assigneeName && (
                            <span
                              title={task.assigneeName}
                              className="h-6 w-6 rounded-full bg-brand text-white text-[10px] font-semibold flex items-center justify-center"
                            >
                              {initials(task.assigneeName)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {addingColumn === col.key ? (
                <div className="mt-2 glass-panel rounded-xl p-2 space-y-2">
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Titre de la tâche..."
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAddingColumn(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => createTask(col)}
                      className="bg-brand text-white rounded-lg px-3 py-1 text-xs font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColumn(col.key)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand mt-2 px-1"
                >
                  <Plus size={14} />
                  Ajouter une carte
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeTask && (
        <TaskDetailModal
          task={{
            id: activeTask.id,
            title: activeTask.title,
            description: activeTask.description,
            clientName: activeTask.clientName,
            assigneeId: activeTask.assigneeId,
            priority: activeTask.priority,
            dueDate: activeTask.dueDate,
            tags: activeTask.tags,
            subtasks: activeTask.subtasks,
            comments: activeTask.comments,
          }}
          users={users}
          onClose={() => setActiveTaskId(null)}
        />
      )}
    </div>
  );
}
