"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, ExternalLink } from "lucide-react";

type Content = { id: string; type: string; title: string; body: string | null; url: string | null };
type Formation = {
  id: string;
  title: string;
  category: string | null;
  level: string | null;
  durationMinutes: number | null;
  tags: string[];
  isPublished: boolean;
  contents: Content[];
};
type Parcours = { id: string; name: string; description: string | null; formations: { formationId: string; formation: { id: string; title: string } }[] };
type Progress = { formationId: string; status: string; score: number | null };

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  completed: "Terminé",
};

export function AcademyView() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadAll() {
    const [f, p, pr] = await Promise.all([
      fetch("/api/admin/academy/formations").then((r) => r.json()),
      fetch("/api/admin/academy/parcours").then((r) => r.json()),
      fetch("/api/academy/progress").then((r) => r.json()),
    ]);
    setFormations(f.filter((x: Formation) => x.isPublished));
    setParcoursList(p);
    setProgress(pr);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function statusOf(formationId: string) {
    return progress.find((p) => p.formationId === formationId)?.status ?? "not_started";
  }

  async function setStatus(formationId: string, status: string) {
    await fetch("/api/academy/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formationId, status }),
    });
    loadAll();
  }

  return (
    <div className="space-y-6">
      {parcoursList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parcoursList.map((p) => (
            <div key={p.id} className="glass-panel rounded-2xl p-5">
              <h2 className="font-semibold mb-1">{p.name}</h2>
              {p.description && <p className="text-sm text-gray-500 mb-2">{p.description}</p>}
              <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
                {p.formations.map((pf) => (
                  <li key={pf.formationId}>{pf.formation.title}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {formations.map((f) => {
          const isExpanded = expandedId === f.id;
          const status = statusOf(f.id);
          return (
            <div key={f.id} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{f.title}</h3>
                    {status === "completed" && <CheckCircle2 size={16} className="text-green-500" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {f.category ?? "—"} · {f.level ?? "—"} · {f.durationMinutes ?? "?"} min · {STATUS_LABELS[status]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(f.id, e.target.value)}
                    className="rounded-xl border border-gray-200 px-2 py-1.5 text-xs"
                  >
                    <option value="not_started">Non commencé</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                  </select>
                  <button onClick={() => setExpandedId(isExpanded ? null : f.id)} className="text-gray-400 hover:text-brand">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {f.contents.map((c) => (
                    <div key={c.id} className="text-sm bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-400 uppercase mr-2">{c.type}</span>
                      {c.type === "text" ? (
                        <span>{c.title} — {c.body}</span>
                      ) : (
                        <a href={c.url ?? "#"} target="_blank" className="text-brand inline-flex items-center gap-1">
                          {c.title} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                  {f.contents.length === 0 && <p className="text-xs text-gray-400">Aucun contenu pour le moment.</p>}
                </div>
              )}
            </div>
          );
        })}
        {formations.length === 0 && <p className="text-sm text-gray-400">Aucune formation disponible.</p>}
      </div>
    </div>
  );
}
