"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";

type CollabUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  office: string | null;
  status: string;
  roleId: string | null;
  roleName: string | null;
  managerId: string | null;
  managerName: string | null;
  teamId: string | null;
  teamName: string | null;
};

type Role = { id: string; name: string };
type Team = { id: string; name: string };

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  office: "",
  roleId: "",
  managerId: "",
  teamId: "",
};

export function CollaboratorsManager() {
  const [users, setUsers] = useState<CollabUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [u, r, t] = await Promise.all([
      fetch("/api/admin/users").then((res) => res.json()),
      fetch("/api/admin/roles").then((res) => res.json()),
      fetch("/api/admin/teams").then((res) => res.json()),
    ]);
    setUsers(u);
    setRoles(r);
    setTeams(t);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(u: CollabUser) {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone ?? "",
      jobTitle: u.jobTitle ?? "",
      department: u.department ?? "",
      office: u.office ?? "",
      roleId: u.roleId ?? "",
      managerId: u.managerId ?? "",
      teamId: u.teamId ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      roleId: form.roleId || null,
      managerId: form.managerId || null,
      teamId: form.teamId || null,
    };
    if (editingId) {
      await fetch(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setLoading(false);
    setOpen(false);
    loadAll();
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          <Plus size={16} />
          Nouveau collaborateur
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">Nom</th>
              <th className="py-3 px-5">Email</th>
              <th className="py-3 px-5">Fonction</th>
              <th className="py-3 px-5">Rôle</th>
              <th className="py-3 px-5">Manager</th>
              <th className="py-3 px-5">Équipe</th>
              <th className="py-3 px-5"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-5 font-medium">{u.firstName} {u.lastName}</td>
                <td className="py-3 px-5 text-gray-500">{u.email}</td>
                <td className="py-3 px-5 text-gray-500">{u.jobTitle ?? "—"}</td>
                <td className="py-3 px-5">
                  <span className="rounded-full bg-brand/10 text-brand text-xs font-medium px-3 py-1">
                    {u.roleName ?? "—"}
                  </span>
                </td>
                <td className="py-3 px-5 text-gray-500">{u.managerName ?? "—"}</td>
                <td className="py-3 px-5 text-gray-500">{u.teamName ?? "—"}</td>
                <td className="py-3 px-5 text-right">
                  <button onClick={() => openEdit(u)} className="text-gray-400 hover:text-brand">
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Aucun collaborateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier le collaborateur" : "Nouveau collaborateur"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Prénom *"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  required
                  placeholder="Nom *"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <input
                required
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Fonction"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Département"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Bureau"
                value={form.office}
                onChange={(e) => setForm({ ...form, office: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Rôle...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select
                value={form.managerId}
                onChange={(e) => setForm({ ...form, managerId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Manager de rattachement...</option>
                {users
                  .filter((u) => u.id !== editingId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
              </select>
              <select
                value={form.teamId}
                onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Équipe de rattachement...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
