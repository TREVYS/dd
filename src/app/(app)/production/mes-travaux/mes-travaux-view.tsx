"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CalendarDays, CheckCircle2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  requiresValidation: boolean;
  client: { id: string; legalName: string };
  mission: { id: string; name: string } | null;
  assignee: { id: string; firstName: string; lastName: string } | null;
  manager: { id: string; firstName: string; lastName: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  todo: "À faire",
  in_progress: "En cours",
  en_attente_client: "En attente client",
  en_attente_manager: "En attente manager",
  done: "Terminé",
  valide: "Validé",
};

const OPEN_STATUSES = ["todo", "in_progress", "en_attente_client", "en_attente_manager"];

type Tab = "today" | "week" | "late" | "review";

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function MesTravauxView({ userId, canValidate }: { userId: string; canValidate: boolean }) {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [reviewTasks, setReviewTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<Tab>("today");
  const [timeForm, setTimeForm] = useState<{ taskId: string; duration: string; comment: string; date: string } | null>(null);

  async function loadAll() {
    const mine: Task[] = await fetch(`/api/tasks?assigneeId=${userId}`).then((r) => r.json());
    setMyTasks(mine);

    if (canValidate) {
      const toReview: Task[] = await fetch(`/api/tasks?status=en_attente_manager&managerId=${userId}`).then((r) => r.json());
      setReviewTasks(toReview);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const today = myTasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), now) && OPEN_STATUSES.includes(t.status));
  const week = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= in7Days && OPEN_STATUSES.includes(t.status)
  );
  const late = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && OPEN_STATUSES.includes(t.status));

  const lists: Record<Tab, Task[]> = { today, week, late, review: reviewTasks };

  async function handleSubmit(taskId: string) {
    await fetch(`/api/tasks/${taskId}/submit`, { method: "POST" });
    loadAll();
  }

  async function handleValidate(taskId: string, decision: "valide" | "refuse" | "correction") {
    await fetch(`/api/tasks/${taskId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    loadAll();
  }

  async function handleLogTime(e: React.FormEvent) {
    e.preventDefault();
    if (!timeForm) return;
    await fetch(`/api/tasks/${timeForm.taskId}/time-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        durationMinutes: Math.round(Number(timeForm.duration) * 60),
        description: timeForm.comment || null,
        entryDate: timeForm.date || undefined,
      }),
    });
    setTimeForm(null);
    loadAll();
  }

  const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
    { key: "today", label: "Aujourd'hui", icon: CalendarDays },
    { key: "week", label: "Cette semaine", icon: Clock },
    { key: "late", label: "Retards", icon: AlertTriangle },
    ...(canValidate ? [{ key: "review" as Tab, label: "À valider", icon: CheckCircle2 }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t.key ? "bg-brand text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            <t.icon size={14} />
            {t.label}
            <span className="text-xs opacity-70">({lists[t.key].length})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {lists[tab].map((t) => (
          <div key={t.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t.client.legalName}
                  {t.mission && ` · ${t.mission.name}`}
                  {t.category && ` · ${t.category}`}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 shrink-0">
                {STATUS_LABELS[t.status] ?? t.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Échéance: {t.dueDate ? new Date(t.dueDate).toLocaleDateString("fr-FR") : "—"}</span>
              <span>
                Temps: {t.actualHours ?? 0}h / {t.estimatedHours ?? "—"}h
              </span>
              <span>Priorité: {t.priority}</span>
              {t.manager && (
                <span>
                  Manager: {t.manager.firstName} {t.manager.lastName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              {tab !== "review" && (
                <>
                  <button
                    onClick={() =>
                      setTimeForm({ taskId: t.id, duration: "", comment: "", date: new Date().toISOString().slice(0, 10) })
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    Déclarer du temps
                  </button>
                  {(t.status === "in_progress" || t.status === "todo") && (
                    <button
                      onClick={() => handleSubmit(t.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white"
                    >
                      Soumettre à validation
                    </button>
                  )}
                </>
              )}
              {tab === "review" && (
                <>
                  <button
                    onClick={() => handleValidate(t.id, "valide")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleValidate(t.id, "correction")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white"
                  >
                    Demander correction
                  </button>
                  <button
                    onClick={() => handleValidate(t.id, "refuse")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white"
                  >
                    Refuser
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {lists[tab].length === 0 && <p className="text-sm text-gray-400 text-center py-8">Rien à afficher ici.</p>}
      </div>

      {timeForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Déclarer du temps</h2>
            <form onSubmit={handleLogTime} className="space-y-3">
              <input
                required
                type="number"
                step="0.25"
                placeholder="Durée (h)"
                value={timeForm.duration}
                onChange={(e) => setTimeForm({ ...timeForm, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={timeForm.date}
                onChange={(e) => setTimeForm({ ...timeForm, date: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Commentaire"
                value={timeForm.comment}
                onChange={(e) => setTimeForm({ ...timeForm, comment: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setTimeForm(null)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button type="submit" className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
