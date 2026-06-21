"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Euro } from "lucide-react";

type Prospect = {
  id: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  estimatedValue: number | null;
  source: string | null;
  pipelineStage: string;
  assignedToName: string | null;
};

type Column = { key: string; label: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PipelineBoard({
  columns,
  prospects,
  isPartner,
}: {
  columns: Column[];
  prospects: Prospect[];
  isPartner: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(prospects);
  const [dragId, setDragId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function moveProspect(prospectId: string, column: Column) {
    const previous = items;
    setItems((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, pipelineStage: column.key } : p))
    );
    const res = await fetch(`/api/prospects/${prospectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipelineStage: column.key }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setItems(previous);
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.refresh();
  }

  async function createProspect(column: Column) {
    if (!newName.trim()) return;
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: newName.trim(), pipelineStage: column.key }),
    });
    const created = await res.json();
    setItems((prev) => [
      {
        id: created.id,
        companyName: created.companyName,
        contactName: created.contactName,
        contactEmail: created.contactEmail,
        estimatedValue: created.estimatedValue ? Number(created.estimatedValue) : null,
        source: created.source,
        pipelineStage: created.pipelineStage,
        assignedToName: null,
      },
      ...prev,
    ]);
    setNewName("");
    setAddingColumn(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">
          {error}
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => {
          const colItems = items.filter((p) => p.pipelineStage === col.key);
          const isSignedColumn = col.key === "clients_actifs";
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) moveProspect(dragId, col);
                setDragId(null);
              }}
              className="bg-gray-50 rounded-2xl p-3 min-h-[300px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold flex items-center gap-1.5">
                  {col.label}
                  {isSignedColumn && !isPartner && (
                    <span className="text-[10px] text-gray-400">(validation associé requise)</span>
                  )}
                </h2>
                <span className="text-xs text-gray-400">{colItems.length}</span>
              </div>

              <div className="space-y-2">
                {colItems.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    onDragStart={() => setDragId(p.id)}
                    className="bg-white rounded-xl p-3 shadow-sm cursor-grab space-y-1.5"
                  >
                    <p className="text-sm font-medium">{p.companyName}</p>
                    {p.contactName && <p className="text-xs text-gray-400">{p.contactName}</p>}
                    <div className="flex items-center justify-between mt-1">
                      {p.estimatedValue ? (
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                          <Euro size={11} />
                          {Number(p.estimatedValue).toLocaleString("fr-FR")}
                        </span>
                      ) : (
                        <span />
                      )}
                      {p.assignedToName && (
                        <span
                          title={p.assignedToName}
                          className="h-6 w-6 rounded-full bg-brand text-white text-[10px] font-semibold flex items-center justify-center"
                        >
                          {initials(p.assignedToName)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {addingColumn === col.key ? (
                <div className="mt-2 bg-white rounded-xl p-2 space-y-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nom de l'entreprise..."
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingColumn(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => createProspect(col)}
                      className="bg-brand text-white rounded-lg px-3 py-1 text-xs font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ) : (
                !isSignedColumn && (
                  <button
                    onClick={() => setAddingColumn(col.key)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand mt-2 px-1"
                  >
                    <Plus size={14} />
                    Ajouter un prospect
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
