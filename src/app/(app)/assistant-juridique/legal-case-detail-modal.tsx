"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";

type Step = { id: string; label: string; isDone: boolean };
type LegalCase = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  dueDate: string | null;
  steps: Step[];
};

export function LegalCaseDetailModal({
  legalCase,
  onClose,
}: {
  legalCase: LegalCase;
  onClose: () => void;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState(legalCase.steps);
  const [stepInput, setStepInput] = useState("");

  async function toggleStep(id: string, isDone: boolean) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, isDone } : s)));
    await fetch(`/api/legal-cases/${legalCase.id}/steps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone }),
    });
  }

  async function addStep() {
    const label = stepInput.trim();
    if (!label) return;
    setStepInput("");
    const res = await fetch(`/api/legal-cases/${legalCase.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const created = await res.json();
    setSteps((prev) => [...prev, { id: created.id, label: created.label, isDone: false }]);
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer le dossier « ${legalCase.title} » ?`)) return;
    await fetch(`/api/legal-cases/${legalCase.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  function handleClose() {
    onClose();
    router.refresh();
  }

  const doneCount = steps.filter((s) => s.isDone).length;
  const overdue = legalCase.dueDate && new Date(legalCase.dueDate) < new Date() && doneCount < steps.length;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{legalCase.title}</h2>
            <p className="text-sm text-gray-400">{legalCase.clientName}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {legalCase.dueDate && (
          <p className={`text-sm font-medium ${overdue ? "text-red-500" : "text-gray-500"}`}>
            Échéance : {new Date(legalCase.dueDate).toLocaleDateString("fr-FR")}
            {overdue && " — en retard"}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <div className="h-1.5 bg-gray-100 rounded-full flex-1 overflow-hidden">
            <div
              className="h-full bg-brand"
              style={{ width: steps.length ? `${(doneCount / steps.length) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {doneCount}/{steps.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {steps.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.isDone}
                onChange={(e) => toggleStep(s.id, e.target.checked)}
                className="accent-brand"
              />
              <span className={s.isDone ? "line-through text-gray-400" : ""}>{s.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStep()}
            placeholder="Ajouter une étape..."
            className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
          />
          <button onClick={addStep} className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm">
            <Plus size={14} />
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500">
            <Trash2 size={13} />
            Supprimer le dossier
          </button>
        </div>
      </div>
    </div>
  );
}
