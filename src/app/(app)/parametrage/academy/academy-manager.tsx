"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, ShoppingCart, Users2, X } from "lucide-react";

type QuizOption = { id: string; text: string; isCorrect: boolean; orderIndex: number };
type QuizQuestion = { id: string; question: string; orderIndex: number; options: QuizOption[] };
type Lesson = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  videoUrl: string | null;
  durationMinutes: number | null;
  orderIndex: number;
  quizQuestions: QuizQuestion[];
};
type Module = { id: string; title: string; orderIndex: number; lessons: Lesson[] };

type Formation = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  level: string | null;
  durationMinutes: number | null;
  tags: string[];
  isPublished: boolean;
  author: { firstName: string; lastName: string } | null;
  modules: Module[];
  _count: { progress: number };
  acquisition: { id: string } | null;
  teamAccess: { id: string; teamId: string }[];
};

type Team = { id: string; name: string };

type ParcoursFormationLink = { formationId: string; formation: { id: string; title: string } };
type Parcours = { id: string; name: string; description: string | null; formations: ParcoursFormationLink[] };

type Progress = {
  id: string;
  status: string;
  score: number | null;
  user: { firstName: string; lastName: string };
  formation: { title: string };
};

const LESSON_TYPES = [
  { value: "video", label: "Vidéo MP4" },
  { value: "pdf", label: "PDF téléchargeable" },
  { value: "text", label: "Documentation (texte riche)" },
  { value: "checklist", label: "Checklist" },
  { value: "quiz", label: "QCM" },
  { value: "case_study", label: "Étude de cas interactive" },
  { value: "webinar", label: "Replay webinaire" },
];

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  completed: "Terminé",
};

const emptyFormation = {
  title: "",
  description: "",
  coverImageUrl: "",
  category: "",
  level: "",
  durationMinutes: "",
  tags: "",
};

export function AcademyManager({ role }: { role: string | null }) {
  const canCreate = role === "Administrateur";
  const canPurchase = role === "Associé";

  const [tab, setTab] = useState<"formations" | "parcours" | "suivi">("formations");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyFormation);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonForm, setLessonForm] = useState({
    type: "text",
    title: "",
    body: "",
    videoUrl: "",
    documentUrl: "",
    durationMinutes: "",
  });
  const [quizDraft, setQuizDraft] = useState<{ lessonId: string; question: string; options: string[]; correct: number } | null>(null);
  const [accessFormationId, setAccessFormationId] = useState<string | null>(null);

  const [parcoursOpen, setParcoursOpen] = useState(false);
  const [parcoursForm, setParcoursForm] = useState({ name: "", description: "", formationIds: [] as string[] });

  async function loadAll() {
    const [f, p, pr, t] = await Promise.all([
      fetch("/api/admin/academy/formations").then((r) => r.json()),
      fetch("/api/admin/academy/parcours").then((r) => r.json()),
      fetch("/api/admin/academy/progress").then((r) => r.json()),
      fetch("/api/admin/teams").then((r) => (r.ok ? r.json() : [])),
    ]);
    setFormations(f);
    setParcoursList(p);
    setProgress(pr);
    setTeams(Array.isArray(t) ? t : []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function acquireFormation(f: Formation) {
    await fetch(`/api/admin/academy/formations/${f.id}/acquire`, { method: "POST" });
    loadAll();
  }

  async function revokeAcquisition(f: Formation) {
    await fetch(`/api/admin/academy/formations/${f.id}/acquire`, { method: "DELETE" });
    loadAll();
  }

  async function grantTeamAccess(formationId: string, teamId: string) {
    await fetch(`/api/admin/academy/formations/${formationId}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    loadAll();
  }

  async function revokeTeamAccess(formationId: string, teamId: string) {
    await fetch(`/api/admin/academy/formations/${formationId}/access?teamId=${teamId}`, { method: "DELETE" });
    loadAll();
  }

  async function handleCreateFormation(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/academy/formations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
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

  async function handleAddModule(formationId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    await fetch(`/api/admin/academy/formations/${formationId}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: moduleTitle }),
    });
    setModuleTitle("");
    loadAll();
  }

  async function deleteModule(id: string) {
    await fetch(`/api/admin/academy/modules/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleAddLesson(moduleId: string, e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/academy/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: lessonForm.type,
        title: lessonForm.title,
        body: lessonForm.type === "text" || lessonForm.type === "checklist" || lessonForm.type === "case_study" ? lessonForm.body : undefined,
        videoUrl: lessonForm.type === "video" || lessonForm.type === "webinar" ? lessonForm.videoUrl : undefined,
        documentUrl: lessonForm.type === "pdf" ? lessonForm.documentUrl : undefined,
        durationMinutes: lessonForm.durationMinutes ? Number(lessonForm.durationMinutes) : undefined,
      }),
    });
    setLessonForm({ type: "text", title: "", body: "", videoUrl: "", documentUrl: "", durationMinutes: "" });
    loadAll();
  }

  async function deleteLesson(id: string) {
    await fetch(`/api/admin/academy/lessons/${id}`, { method: "DELETE" });
    loadAll();
  }

  async function handleAddQuizQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!quizDraft || !quizDraft.question.trim()) return;
    const options = quizDraft.options.filter((o) => o.trim());
    if (options.length < 2) return;
    await fetch(`/api/admin/academy/lessons/${quizDraft.lessonId}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: quizDraft.question,
        options: options.map((text, i) => ({ text, isCorrect: i === quizDraft.correct })),
      }),
    });
    setQuizDraft(null);
    loadAll();
  }

  async function deleteQuizQuestion(id: string) {
    await fetch(`/api/admin/academy/quiz-questions/${id}`, { method: "DELETE" });
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
          {canCreate && (
            <div className="flex justify-end">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
              >
                <Plus size={16} />
                Nouvelle formation
              </button>
            </div>
          )}

          <div className="space-y-3">
            {formations.map((f) => {
              const isExpanded = expandedId === f.id;
              const acquired = Boolean(f.acquisition);
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
                        {canPurchase && (
                          <span
                            className={`text-xs rounded-full px-2 py-0.5 ${
                              acquired ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {acquired ? `Achetée · ${f.teamAccess.length} équipe(s)` : "Non achetée"}
                          </span>
                        )}
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
                      {canPurchase &&
                        (acquired ? (
                          <>
                            <button
                              onClick={() => setAccessFormationId(f.id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand"
                              title="Rendre disponible à une équipe"
                            >
                              <Users2 size={14} />
                              Équipes
                            </button>
                            <button onClick={() => revokeAcquisition(f)} className="text-xs text-gray-500 hover:text-red-500">
                              Annuler l&apos;achat
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => acquireFormation(f)}
                            className="flex items-center gap-1 text-xs bg-brand/10 text-brand rounded-lg px-2 py-1 hover:bg-brand/20"
                          >
                            <ShoppingCart size={14} />
                            Acheter
                          </button>
                        ))}
                      {canCreate && (
                        <>
                          <button onClick={() => togglePublish(f)} className="text-xs text-gray-500 hover:text-brand">
                            {f.isPublished ? "Dépublier" : "Publier"}
                          </button>
                          <button onClick={() => deleteFormation(f.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
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
                      {f.modules.map((m) => {
                        const moduleExpanded = expandedModuleId === m.id;
                        return (
                          <div key={m.id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setExpandedModuleId(moduleExpanded ? null : m.id)}
                                className="flex items-center gap-2 text-sm font-medium"
                              >
                                {moduleExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {m.title}
                                <span className="text-xs text-gray-400">({m.lessons.length} leçon(s))</span>
                              </button>
                              {canCreate && (
                                <button onClick={() => deleteModule(m.id)} className="text-gray-400 hover:text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                            {moduleExpanded && (
                              <div className="mt-3 space-y-2 pl-2">
                                {m.lessons.map((l) => (
                                  <div key={l.id} className="bg-white rounded-lg px-3 py-2 text-sm space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span>
                                        <span className="text-xs text-gray-400 uppercase mr-2">{l.type}</span>
                                        {l.title}
                                        {l.durationMinutes ? <span className="text-xs text-gray-400 ml-2">{l.durationMinutes} min</span> : null}
                                      </span>
                                      {canCreate && (
                                        <button onClick={() => deleteLesson(l.id)} className="text-gray-400 hover:text-red-500">
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                    {l.type === "quiz" && (
                                      <div className="space-y-1 pl-2">
                                        {l.quizQuestions.map((q) => (
                                          <div key={q.id} className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                              {q.question} —{" "}
                                              {q.options.map((o) => (o.isCorrect ? `[${o.text}]` : o.text)).join(", ")}
                                            </span>
                                            {canCreate && (
                                              <button onClick={() => deleteQuizQuestion(q.id)} className="text-gray-400 hover:text-red-500">
                                                <Trash2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                        {canCreate &&
                                          (quizDraft?.lessonId === l.id ? (
                                            <form onSubmit={handleAddQuizQuestion} className="space-y-1 pt-1">
                                              <input
                                                required
                                                placeholder="Question *"
                                                value={quizDraft.question}
                                                onChange={(e) => setQuizDraft({ ...quizDraft, question: e.target.value })}
                                                className="w-full rounded-lg border border-gray-200 px-2 py-1 text-xs"
                                              />
                                              {quizDraft.options.map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                  <input
                                                    type="radio"
                                                    checked={quizDraft.correct === i}
                                                    onChange={() => setQuizDraft({ ...quizDraft, correct: i })}
                                                  />
                                                  <input
                                                    placeholder={`Réponse ${i + 1}`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                      const options = [...quizDraft.options];
                                                      options[i] = e.target.value;
                                                      setQuizDraft({ ...quizDraft, options });
                                                    }}
                                                    className="flex-1 rounded-lg border border-gray-200 px-2 py-1 text-xs"
                                                  />
                                                </div>
                                              ))}
                                              <div className="flex justify-end gap-2 pt-1">
                                                <button type="button" onClick={() => setQuizDraft(null)} className="text-xs text-gray-400">
                                                  Annuler
                                                </button>
                                                <button type="submit" className="text-xs bg-brand text-white rounded-lg px-3 py-1">
                                                  Ajouter la question
                                                </button>
                                              </div>
                                            </form>
                                          ) : (
                                            <button
                                              onClick={() =>
                                                setQuizDraft({ lessonId: l.id, question: "", options: ["", "", "", ""], correct: 0 })
                                              }
                                              className="text-xs text-brand"
                                            >
                                              + Ajouter une question
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {canCreate && (
                                  <form onSubmit={(e) => handleAddLesson(m.id, e)} className="flex flex-wrap gap-2 items-end pt-1">
                                    <select
                                      value={lessonForm.type}
                                      onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                                    >
                                      {LESSON_TYPES.map((lt) => (
                                        <option key={lt.value} value={lt.value}>{lt.label}</option>
                                      ))}
                                    </select>
                                    <input
                                      required
                                      placeholder="Titre de la leçon *"
                                      value={lessonForm.title}
                                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs flex-1 min-w-[140px]"
                                    />
                                    {(lessonForm.type === "video" || lessonForm.type === "webinar") && (
                                      <input
                                        placeholder="URL vidéo"
                                        value={lessonForm.videoUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs flex-1 min-w-[160px]"
                                      />
                                    )}
                                    {lessonForm.type === "pdf" && (
                                      <input
                                        placeholder="URL du PDF"
                                        value={lessonForm.documentUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, documentUrl: e.target.value })}
                                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs flex-1 min-w-[160px]"
                                      />
                                    )}
                                    {(lessonForm.type === "text" || lessonForm.type === "checklist" || lessonForm.type === "case_study") && (
                                      <input
                                        placeholder="Contenu"
                                        value={lessonForm.body}
                                        onChange={(e) => setLessonForm({ ...lessonForm, body: e.target.value })}
                                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs flex-1 min-w-[160px]"
                                      />
                                    )}
                                    <input
                                      type="number"
                                      placeholder="Durée (min)"
                                      value={lessonForm.durationMinutes}
                                      onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: e.target.value })}
                                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs w-24"
                                    />
                                    <button type="submit" className="bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-medium">
                                      Ajouter
                                    </button>
                                  </form>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {canCreate && (
                        <form onSubmit={(e) => handleAddModule(f.id, e)} className="flex gap-2">
                          <input
                            placeholder="Nom du module *"
                            value={moduleTitle}
                            onChange={(e) => setModuleTitle(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                          />
                          <button type="submit" className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium">
                            + Module
                          </button>
                        </form>
                      )}
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
              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="URL image de couverture"
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
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

      {accessFormationId && (() => {
        const f = formations.find((x) => x.id === accessFormationId);
        if (!f) return null;
        const accessTeamIds = f.teamAccess.map((a) => a.teamId);
        return (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="glass-panel rounded-2xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Équipes ayant accès</h2>
                <button onClick={() => setAccessFormationId(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">{f.title}</p>
              <div className="space-y-1">
                {teams.map((t) => {
                  const checked = accessTeamIds.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          checked ? revokeTeamAccess(f.id, t.id) : grantTeamAccess(f.id, t.id)
                        }
                      />
                      {t.name}
                    </label>
                  );
                })}
                {teams.length === 0 && <p className="text-xs text-gray-400">Aucune équipe créée.</p>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
