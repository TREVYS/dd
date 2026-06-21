"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

type ClientOption = { id: string; legalName: string; commercialName: string | null };

export function NewTicketButton({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientId: clients[0]?.id ?? "",
    subject: "",
    description: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
      >
        <Plus size={16} />
        Nouveau ticket
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Créer un ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.commercialName || c.legalName}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Sujet"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                rows={3}
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
    </>
  );
}
