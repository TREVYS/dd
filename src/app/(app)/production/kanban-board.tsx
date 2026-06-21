"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CheckSquare, MessageSquare, X } from "lucide-react";
import { TaskDetailModal } from "./task-detail-modal";

type Task = {
  id: string;
  title: string;
  clientName: string;
  assigneeId: string | null;
  assigneeName: string | null;
  priority: string;
  kanbanColumn: string;
  status: string;
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

  async function moveTask(taskId: string, column: Column) {
    setItems((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, kanbanColumn: column.key, status: column.status }
          : t
      )
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kanbanColumn: column.key, status: column.status }),
    });
    router.refresh();
  }

  async function createTask(column: Column) {
    if (!newTitle.trim() || !newClientId) return;
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
        clientName: created.client.legalName,
        assigneeId: null,
        assigneeName: null,
        priority: created.priority,
        kanbanColumn: created.kanbanColumn,
        status: created.status,
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
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = items.filter((t) => t.kanbanColumn === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) moveTask(dragId, col);
              setDragId(null);
            }}
            className="bg-gray-50 rounded-2xl p-3 min-h-[300px]"
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
                    onClick={() => setActiveTaskId(task.id)}
                    className="bg-white rounded-xl p-3 shadow-sm cursor-grab space-y-2"
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
              <div className="mt-2 bg-white rounded-xl p-2 space-y-2">
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

      {activeTask && (
        <TaskDetailModal
          task={{
            id: activeTask.id,
            title: activeTask.title,
            clientName: activeTask.clientName,
            assigneeId: activeTask.assigneeId,
            priority: activeTask.priority,
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
