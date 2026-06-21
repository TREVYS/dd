"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2, Tag, CheckSquare, MessageSquare } from "lucide-react";

export type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  clientName: string;
  assigneeId: string | null;
  priority: string;
  dueDate: string | null;
  tags: string[];
  subtasks: { id: string; title: string; isDone: boolean }[];
  comments: { id: string; body: string; authorName: string; createdAt: string }[];
};

export function TaskDetailModal({
  task,
  users,
  onClose,
}: {
  task: TaskDetail;
  users: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [tags, setTags] = useState(task.tags);
  const [tagInput, setTagInput] = useState("");
  const [subtasks, setSubtasks] = useState(task.subtasks);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [comments, setComments] = useState(task.comments);
  const [commentInput, setCommentInput] = useState("");

  async function saveField(data: Record<string, unknown>) {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  function addTag() {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    const next = [...tags, value];
    setTags(next);
    setTagInput("");
    saveField({ tags: next });
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    saveField({ tags: next });
  }

  async function addSubtask() {
    const value = subtaskInput.trim();
    if (!value) return;
    setSubtaskInput("");
    const res = await fetch(`/api/tasks/${task.id}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: value }),
    });
    const created = await res.json();
    setSubtasks((prev) => [...prev, { id: created.id, title: created.title, isDone: false }]);
  }

  async function toggleSubtask(id: string, isDone: boolean) {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, isDone } : s)));
    await fetch(`/api/tasks/${task.id}/subtasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone }),
    });
  }

  async function removeSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/tasks/${task.id}/subtasks/${id}`, { method: "DELETE" });
  }

  async function addComment() {
    const value = commentInput.trim();
    if (!value) return;
    setCommentInput("");
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: value }),
    });
    const created = await res.json();
    setComments((prev) => [
      ...prev,
      {
        id: created.id,
        body: created.body,
        authorName: created.author ? `${created.author.firstName} ${created.author.lastName}` : "Moi",
        createdAt: created.createdAt,
      },
    ]);
  }

  function handleClose() {
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-start justify-between gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => saveField({ title })}
            className="text-lg font-semibold flex-1 outline-none border-b border-transparent focus:border-gray-200"
          />
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-400">{task.clientName}</p>

        <div>
          <label className="text-xs text-gray-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => saveField({ description: description || null })}
            placeholder="Décrire la tâche..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mt-1 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400">Échéance</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                saveField({ dueDate: e.target.value || null });
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Priorité</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                saveField({ priority: e.target.value });
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mt-1"
            >
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">Assigné à</label>
            <select
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                saveField({ assignedTo: e.target.value || null });
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm mt-1"
            >
              <option value="">Non affecté</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
            <Tag size={13} /> Étiquettes
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2 py-1 rounded-full"
              >
                {t}
                <button onClick={() => removeTag(t)}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Ajouter une étiquette..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
            />
            <button onClick={addTag} className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
            <CheckSquare size={13} /> Checklist ({subtasks.filter((s) => s.isDone).length}/{subtasks.length})
          </div>
          <div className="space-y-1.5 mb-2">
            {subtasks.map((s) => (
              <div key={s.id} className="flex items-center gap-2 group">
                <input
                  type="checkbox"
                  checked={s.isDone}
                  onChange={(e) => toggleSubtask(s.id, e.target.checked)}
                  className="accent-brand"
                />
                <span className={`text-sm flex-1 ${s.isDone ? "line-through text-gray-400" : ""}`}>
                  {s.title}
                </span>
                <button
                  onClick={() => removeSubtask(s.id)}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
              placeholder="Ajouter un élément..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
            />
            <button onClick={addSubtask} className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-2">
            <MessageSquare size={13} /> Commentaires
          </div>
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-gray-600">{c.authorName}</p>
                <p className="text-sm">{c.body}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-xs text-gray-400">Aucun commentaire.</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addComment()}
              placeholder="Écrire un commentaire..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
            />
            <button onClick={addComment} className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
