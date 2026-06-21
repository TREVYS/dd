"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type ClientOption = { id: string; legalName: string; commercialName: string | null };
type Line = { label: string; quantity: string; unitPrice: string; estimatedHours: string };

const emptyLine: Line = { label: "", quantity: "1", unitPrice: "0", estimatedHours: "0" };

export function NewQuoteButton({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [prospectName, setProspectName] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: clientId || undefined,
        prospectName: prospectName || undefined,
        lines,
      }),
    });
    setLoading(false);
    setOpen(false);
    setLines([{ ...emptyLine }]);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
      >
        <Plus size={16} />
        Nouveau devis
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Générer un devis</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">— Prospect —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.commercialName || c.legalName}
                  </option>
                ))}
              </select>
              {!clientId && (
                <input
                  placeholder="Nom du prospect"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              )}

              <div className="space-y-2">
                {lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      placeholder="Prestation"
                      value={line.label}
                      onChange={(e) => updateLine(i, { label: e.target.value })}
                      className="col-span-5 rounded-xl border border-gray-200 px-2 py-2 text-sm"
                    />
                    <input
                      placeholder="Qté"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, { quantity: e.target.value })}
                      className="col-span-2 rounded-xl border border-gray-200 px-2 py-2 text-sm"
                    />
                    <input
                      placeholder="Prix"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(i, { unitPrice: e.target.value })}
                      className="col-span-2 rounded-xl border border-gray-200 px-2 py-2 text-sm"
                    />
                    <input
                      placeholder="Heures"
                      value={line.estimatedHours}
                      onChange={(e) => updateLine(i, { estimatedHours: e.target.value })}
                      className="col-span-2 rounded-xl border border-gray-200 px-2 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                      className="col-span-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, { ...emptyLine }])}
                className="text-sm text-brand"
              >
                + Ajouter une ligne
              </button>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Création..." : "Générer le devis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
