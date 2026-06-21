"use client";

import { useState } from "react";
import { LegalCaseDetailModal } from "./legal-case-detail-modal";

type LegalCaseRow = {
  id: string;
  title: string;
  clientName: string;
  status: string;
  dueDate: string | null;
  legalForm: string | null;
  fiscalYear: number | null;
  steps: { id: string; label: string; isDone: boolean }[];
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  a_faire: { label: "À faire", cls: "bg-gray-100 text-gray-500" },
  en_cours: { label: "En cours", cls: "bg-amber-50 text-amber-600" },
  termine: { label: "Terminé", cls: "bg-emerald-50 text-emerald-600" },
};

export function LegalCasesBoard({ cases }: { cases: LegalCaseRow[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = cases.find((c) => c.id === activeId) ?? null;

  if (cases.length === 0) {
    return <p className="text-sm text-gray-400 py-8 text-center">Aucun dossier pour le moment.</p>;
  }

  return (
    <div className="space-y-2">
      {cases.map((c) => {
        const doneCount = c.steps.filter((s) => s.isDone).length;
        const overdue =
          c.dueDate && new Date(c.dueDate) < new Date() && doneCount < c.steps.length;
        const statusMeta = STATUS_LABELS[c.status] ?? STATUS_LABELS.a_faire;
        return (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className="w-full text-left glass-panel rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{c.title}</p>
              <p className="text-xs text-gray-400">
                {c.clientName}
                {c.legalForm ? ` · ${c.legalForm}` : ""}
                {c.fiscalYear ? ` · Exercice ${c.fiscalYear}` : ""}
              </p>
            </div>

            {c.steps.length > 0 && (
              <div className="flex items-center gap-1.5 w-32 shrink-0">
                <div className="h-1.5 bg-gray-100 rounded-full flex-1 overflow-hidden">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${(doneCount / c.steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {doneCount}/{c.steps.length}
                </span>
              </div>
            )}

            {c.dueDate && (
              <span className={`text-xs font-medium shrink-0 ${overdue ? "text-red-500" : "text-gray-400"}`}>
                {new Date(c.dueDate).toLocaleDateString("fr-FR")}
              </span>
            )}

            <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusMeta.cls}`}>
              {statusMeta.label}
            </span>
          </button>
        );
      })}

      {active && (
        <LegalCaseDetailModal
          legalCase={{
            id: active.id,
            title: active.title,
            clientName: active.clientName,
            status: active.status,
            dueDate: active.dueDate,
            steps: active.steps,
          }}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}
