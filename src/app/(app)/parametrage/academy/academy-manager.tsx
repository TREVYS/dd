"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Content = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  orderIndex: number;
};

type Formation = {
  id: string;
  title: string;
  category: string | null;
  level: string | null;
  durationMinutes: number | null;
  tags: string[];
  isPublished: boolean;
  author: { firstName: string; lastName: string } | null;
  contents: Content[];
  _count: { progress: number };
};

type ParcoursFormationLink = { formationId: string; formation: { id: string; title: string } };
type Parcours = { id: string; name: string; description: string | null; formations: ParcoursFormationLink[] };

type Progress = {
  id: string;
  status: string;
  score: number | null;
  user: { firstName: string; lastName: string };
  formation: { title: string };
};

const CONTENT_TYPES = [
  { value: "text", label: "Texte" },
  { value: "pdf", label: "PDF" },
  { value: "word", label: "Word" },
  { value: "excel", label: "Excel" },
  { value: "powerpoint", label: "PowerPoint" },
  { value: "video", label: "Vidéo" },
  { value: "link", label: "Lien externe" },
];

const FILE_TYPES = ["pdf", "word", "excel", "powerpoint"];

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  completed: "Terminé",
};

const emptyFormation = { title: "", category: "", level: "", durationMinutes: "", tags: "" };

export function AcademyManager() {
  const [tab, setTab] = useState<"formations" | "parcours" | "suivi">("formations");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyFormation);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contentForm, setContentForm] = useState({ type: "text", title: "", body: "", url: "" });

  const [parcoursOpen, setParcoursOpen] = useState(false);
  const [parcoursForm, setParcoursForm] = useState({ name: "", description: "", formationIds: [] as string[] });

  async function loadAll() {
    const [f, p, pr] = await Promise.all([
      fetch("/api/admin/academy/formations").then((r) => r.json()),
      fetch("/api/admin/academy/parcours").then((r) => r.json()),
      fetch("/api/admin/academy/progress").then((r) => r.json()),
    ]);
    setFormations(f);
    setParcoursList(p);
    setProgress(pr);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateFormation(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/academy/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        category: form.category || undefined,
        level: form.level || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      }),
    });
    setLoading(false);
    setOpen(false);
    setForm(emptyFormation);
    loadAll();
  }

  async function togglePublish(f: Formation) {
    await fetch(`/api/admin/academy/formations/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !f.isPublished }),
    });
    loadAll();
  }

  async function deleteFormation(id: string) {
    await fetch(`/api/admin/academy/formations/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleAddContent(formationId: string, e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/academy/formations/${formationId}/contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: contentForm.type,
        title: contentForm.title,
        body: contentForm.type === "text" ? contentForm.body : undefined,
        url: contentForm.type !== "text" ? contentForm.url : undefined,
      }),
    });
    setContentForm({ type: "text", title: "", body: "", url: "" });
    loadAll();
  }

  async function deleteContent(id: string) {
    await fetch(`/api/admin/academy/contents/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleCreateParcours(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/academy/parcours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parcoursForm),
    });
    setLoading(false);
    setParcoursOpen(false);
    setParcoursForm({ name: "", description: "", formationIds: [] });
    loadAll();
  }

  async function deleteParcours(id: string) {
    await fetch(`/api/admin/academy/parcours/${id}`, { method: "DELETE" });
    loadAll();
  }

  function toggleFormationInParcours(id: string) {
    setParcoursForm((p) => ({
      ...p,
      formationIds: p.formationIds.includes(id)
        ? p.formationIds.filter((x) => x !== id)
        : [...p.formationIds, id],
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["formations", "parcours", "suivi"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t === "formations" ? "Formations" : t === "parcours" ? "Parcours" : "Suivi"}
          </button>
        ))}
      </div>

      {tab === "formations" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
            >
              <Plus size={16} />
              Nouvelle formation
            </button>
          </div>

          <div className="space-y-3">
            {formations.map((f) => {
              const isExpanded = expandedId === f.id;
              return (
                <div key={f.id} className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{f.title}</h3>
                        <span
                          className={`text-xs rounded-full px-2 py-0.5 ${
                            f.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {f.isPublished ? "Publiée" : "Brouillon"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {f.category ?? "—"} · {f.level ?? "—"} · {f.durationMinutes ?? "?"} min ·{" "}
                        {f._count.progress} suivi(s)
                      </p>
                      {f.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {f.tags.map((t) => (
                            <span key={t} className="text-xs bg-brand/10 text-brand rounded-full px-2 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePublish(f)} className="text-xs text-gray-500 hover:text-brand">
                        {f.isPublished ? "Dépublier" : "Publier"}
                      </button>
                      <button onClick={() => deleteFormation(f.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : f.id)}
                        className="text-gray-400 hover:text-brand"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {f.contents.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                          <span>
                            <span className="text-xs text-gray-400 uppercase mr-2">{c.type}</span>
                            {c.title}
                          </span>
                          <button onClick={() => deleteContent(c.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <form onSubmit={(e) => handleAddContent(f.id, e)} className="flex flex-wrap gap-2 items-end">
                        <select
                          value={contentForm.type}
                          onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                        >
                          {CONTENT_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                          ))}
                        </select>
                        <input
                          required
                          placeholder="Titre du contenu *"
                          value={contentForm.title}
                          onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm flex-1 min-w-[160px]"
                        />
                        {contentForm.type === "text" ? (
                          <input
                            placeholder="Contenu texte"
                            value={contentForm.body}
                            onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm flex-1 min-w-[200px]"
                          />
                        ) : (
                          <input
                            placeholder={FILE_TYPES.includes(contentForm.type) ? "URL du fichier" : "URL"}
                            value={contentForm.url}
                            onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm flex-1 min-w-[200px]"
                          />
                        )}
                        <button
                          type="submit"
                          className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium"
                        >
                          Ajouter
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
            {formations.length === 0 && <p className="text-sm text-gray-400">Aucune formation pour le moment.</p>}
          </div>
        </>
      )}

      {tab === "parcours" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setParcoursOpen(true)}
              className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
            >
              <Plus size={16} />
              Nouveau parcours
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parcoursList.map((p) => (
              <div key={p.id} className="glass-panel rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <button onClick={() => deleteParcours(p.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
                {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  {p.formations.map((pf) => (
                    <li key={pf.formationId}>{pf.formation.title}</li>
                  ))}
                </ol>
                {p.formations.length === 0 && <p className="text-xs text-gray-400">Aucune formation rattachée.</p>}
              </div>
            ))}
            {parcoursList.length === 0 && <p className="text-sm text-gray-400">Aucun parcours pour le moment.</p>}
          </div>
        </>
      )}

      {tab === "suivi" && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-3 px-5">Collaborateur</th>
                <th className="py-3 px-5">Formation</th>
                <th className="py-3 px-5">Statut</th>
                <th className="py-3 px-5">Score</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-3 px-5 font-medium">{p.user.firstName} {p.user.lastName}</td>
                  <td className="py-3 px-5">{p.formation.title}</td>
                  <td className="py-3 px-5 text-gray-500">{STATUS_LABELS[p.status] ?? p.status}</td>
                  <td className="py-3 px-5 text-gray-500">{p.score ?? "—"}</td>
                </tr>
              ))}
              {progress.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Aucun suivi pour le moment.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Nouvelle formation</h2>
            <form onSubmit={handleCreateFormation} className="space-y-3">
              <input
                required
                placeholder="Titre *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Catégorie"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Niveau"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <input
                type="number"
                placeholder="Durée (minutes)"
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Tags (séparés par des virgules)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
                  {loading ? "Enregistrement..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {parcoursOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Nouveau parcours</h2>
            <form onSubmit={handleCreateParcours} className="space-y-3">
              <input
                required
                placeholder="Nom du parcours *"
                value={parcoursForm.name}
                onChange={(e) => setParcoursForm({ ...parcoursForm, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Description"
                value={parcoursForm.description}
                onChange={(e) => setParcoursForm({ ...parcoursForm, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div>
                <p className="text-xs text-gray-400 mb-2">Formations à inclure</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {formations.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={parcoursForm.formationIds.includes(f.id)}
                        onChange={() => toggleFormationInParcours(f.id)}
                      />
                      {f.title}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setParcoursOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
