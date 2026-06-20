"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  clientName: string;
  assigneeName: string | null;
  priority: string;
  kanbanColumn: string;
  status: string;
};

type Column = { key: string; label: string; status: string };

export function KanbanBoard({
  columns,
  tasks,
}: {
  columns: Column[];
  tasks: Task[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<string | null>(null);

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
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragId(task.id)}
                  className="bg-white rounded-xl p-3 shadow-sm cursor-grab"
                >
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.clientName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {task.assigneeName ?? "Non affecté"}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-500"
                          : "bg-brand/10 text-brand"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
