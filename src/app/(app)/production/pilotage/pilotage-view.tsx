"use client";

import { useEffect, useState } from "react";
import { Plus, AlertTriangle, Clock, Gauge, Users, FolderX, ListChecks } from "lucide-react";

type Client = { id: string; legalName: string };
type Person = { id: string; firstName: string; lastName: string };

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  client: { id: string; legalName: string };
  assignee: { id: string; firstName: string; lastName: string } | null;
};

type ChargeRow = { id: string; name: string; capacity: number; assigned: number; chargePercent: number };

type Dashboard = {
  openTasks: number;
  lateTasks: number;
  dueSoonTasks: number;
  chargeHours: number;
  availability: number;
  inactiveClients: number;
};

const CATEGORIES = [
  "Comptabilité",
  "Fiscalité",
  "Juridique",
  "Social",
  "Facturation électronique",
  "Conseil",
  "Administratif",
  "Révision",
  "Reporting",
];

const STATUS_LABELS: Record<string, string> = {
  todo: "À faire",
  in_progress: "En cours",
  en_attente_client: "En attente client",
  en_attente_manager: "En attente manager",
  done: "Terminé",
  valide: "Validé",
};

const initialForm = {
  title: "",
  description: "",
  clientId: "",
  assignedTo: "",
  secondaryAssigneeIds: [] as string[],
  managerId: "",
  dueDate: "",
  estimatedHours: "",
  priority: "normal",
  category: "",
  requiresValidation: false,
};

export function PilotageView() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [charge, setCharge] = useState<ChargeRow[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ assigneeId: "", clientId: "", status: "", priority: "" });

  async function loadAll() {
    const params = new URLSearchParams();
    if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
    if (filters.clientId) params.set("clientId", filters.clientId);
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);

    const [d, c, t, cl, u] = await Promise.all([
      fetch("/api/pilotage/dashboard").then((r) => r.json()),
      fetch("/api/pilotage/charge").then((r) => r.json()),
      fetch(`/api/tasks?${params.toString()}`).then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/collaborators").then((r) => r.json()).catch(() => []),
    ]);
    setDashboard(d);
    setCharge(c);
    setTasks(t);
    setClients(cl);
    setUsers(Array.isArray(u) ? u : (u.users ?? []));
  }

  useEffect(() => {
    loadAll();
  }, [filters]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.clientId,
        title: form.title,
        description: form.description || null,
        taskType: "pilotage",
        kanbanColumn: "a_faire",
        status: "todo",
        priority: form.priority,
        category: form.category || null,
        assignedTo: form.assignedTo || null,
        secondaryAssigneeIds: form.secondaryAssigneeIds,
        managerId: form.managerId || null,
        dueDate: form.dueDate || null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        requiresValidation: form.requiresValidation,
      }),
    });
    setSaving(false);
    setOpen(false);
    setForm(initialForm);
    loadAll();
  }

  const cards = dashboard
    ? [
        { label: "Travaux en cours", value: dashboard.openTasks, icon: ListChecks, tone: "text-brand" },
        { label: "Travaux en retard", value: dashboard.lateTasks, icon: AlertTriangle, tone: "text-red-500" },
        { label: "Échéance 7 jours", value: dashboard.dueSoonTasks, icon: Clock, tone: "text-amber-500" },
        { label: "Charge cabinet", value: `${dashboard.chargeHours} h`, icon: Gauge, tone: "text-brand" },
        { label: "Disponibilité moyenne", value: `${dashboard.availability} %`, icon: Users, tone: "text-emerald-600" },
        { label: "Dossiers sans activité", value: dashboard.inactiveClients, icon: FolderX, tone: "text-gray-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-4">
            <c.icon size={16} className={c.tone} />
            <p className="text-2xl font-semibold mt-2">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-3">Plan de charge par collaborateur</h2>
        <div className="space-y-2">
          {charge.map((row) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-sm w-32 truncate">{row.name}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.chargePercent > 100 ? "bg-red-500" : row.chargePercent > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(row.chargePercent, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-32 shrink-0 text-right">
                {row.assigned}h / {row.capacity}h ({row.chargePercent}%)
              </span>
            </div>
          ))}
          {charge.length === 0 && <p className="text-xs text-gray-400">Aucun collaborateur actif.</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filters.assigneeId}
          onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Tous les collaborateurs</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>
        <select
          value={filters.clientId}
          onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.legalName}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">Toutes priorités</option>
          <option value="low">Faible</option>
          <option value="normal">Normale</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium ml-auto"
        >
          <Plus size={16} />
          Nouvelle tâche
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4">Tâche</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Responsable</th>
              <th className="py-3 px-4">Échéance</th>
              <th className="py-3 px-4">Charge</th>
              <th className="py-3 px-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <p className="font-medium">{t.title}</p>
                  {t.category && <p className="text-xs text-gray-400">{t.category}</p>}
                </td>
                <td className="py-3 px-4 text-gray-500">{t.client.legalName}</td>
                <td className="py-3 px-4 text-gray-500">
                  {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : "Non affecté"}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {t.actualHours ?? 0}h / {t.estimatedHours ?? "—"}h
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {STATUS_LABELS[t.status] ?? t.status}
                  </span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Aucune tâche pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Nouvelle tâche</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Titre (ex: Préparer TVA juin 2026)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legalName}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">Collaborateur principal</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
                <select
                  value={form.managerId}
                  onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">Manager responsable</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Temps prévu (h)"
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="low">Faible</option>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">Catégorie</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.requiresValidation}
                  onChange={(e) => setForm({ ...form, requiresValidation: e.target.checked })}
                />
                Nécessite une validation manager/associé
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
