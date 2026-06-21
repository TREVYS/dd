"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calculator } from "lucide-react";

type Client = { id: string; legalName: string };
type ValuationItem = {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  client: { id: string; legalName: string };
  createdBy: { firstName: string; lastName: string } | null;
  _count: { versions: number };
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  in_progress: "En cours",
  finalized: "Finalisée",
};

export function ValorisationListView() {
  const router = useRouter();
  const [valuations, setValuations] = useState<ValuationItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ clientId: "", title: "" });
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [v, c] = await Promise.all([
      fetch("/api/valuations").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]);
    setValuations(v);
    setClients(c);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/valuations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/production/valorisation/${created.id}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          <Plus size={16} />
          Nouvelle valorisation
        </button>
      </div>

      <div className="space-y-3">
        {valuations.map((v) => (
          <button
            key={v.id}
            onClick={() => router.push(`/production/valorisation/${v.id}`)}
            className="w-full glass-panel rounded-2xl p-5 flex items-center justify-between text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <Calculator size={18} />
              </div>
              <div>
                <p className="font-semibold">{v.title}</p>
                <p className="text-xs text-gray-400">
                  {v.client.legalName} · {v._count.versions} version(s)
                </p>
              </div>
            </div>
            <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-500">
              {STATUS_LABELS[v.status] ?? v.status}
            </span>
          </button>
        ))}
        {valuations.length === 0 && <p className="text-sm text-gray-400">Aucune valorisation pour le moment.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Nouvelle valorisation</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un client *</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legalName}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Titre du dossier *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
