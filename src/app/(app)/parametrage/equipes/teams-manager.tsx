"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";

type Member = { id: string; name: string; roleName: string | null; weeklyCapacityHours: number };
type Team = { id: string; name: string; members: Member[] };

export function TeamsManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTeams() {
    const data = await fetch("/api/admin/teams").then((r) => r.json());
    setTeams(data);
  }

  useEffect(() => {
    loadTeams();
  }, []);

  function openCreate() {
    setEditingId(null);
    setName("");
    setOpen(true);
  }

  function openEdit(t: Team) {
    setEditingId(t.id);
    setName(t.name);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await fetch(`/api/admin/teams/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
    setLoading(false);
    setOpen(false);
    loadTeams();
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          <Plus size={16} />
          Nouvelle équipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((t) => {
          const totalCapacity = t.members.reduce((s, m) => s + m.weeklyCapacityHours, 0);
          return (
            <div key={t.id} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{t.name}</h2>
                <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-brand">
                  <Pencil size={15} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {t.members.length} collaborateur(s) · {totalCapacity}h/semaine de capacité cumulée
              </p>
              <div className="space-y-1.5">
                {t.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="text-xs text-gray-400">{m.roleName ?? "—"}</span>
                  </div>
                ))}
                {t.members.length === 0 && (
                  <p className="text-xs text-gray-400">Aucun membre rattaché.</p>
                )}
              </div>
            </div>
          );
        })}
        {teams.length === 0 && (
          <p className="text-sm text-gray-400">Aucune équipe pour le moment.</p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Modifier l'équipe" : "Nouvelle équipe"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Nom de l'équipe *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
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
