"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  PlayCircle,
  FileText,
  FileQuestion,
  ListChecks,
  Video,
  Search,
  Award,
  Sparkles,
  ArrowLeft,
  Download,
} from "lucide-react";

type QuizOption = { id: string; text: string; isCorrect: boolean };
type QuizQuestion = { id: string; question: string; options: QuizOption[] };
type Lesson = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  videoUrl: string | null;
  documentId: string | null;
  document: { fileUrl: string } | null;
  durationMinutes: number | null;
  quizQuestions: QuizQuestion[];
};
type Module = { id: string; title: string; lessons: Lesson[] };
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
  modules: Module[];
};
type Parcours = { id: string; name: string; description: string | null; formations: { formationId: string; formation: { id: string; title: string } }[] };
type LessonProgress = { lessonId: string; isCompleted: boolean; lastPositionSeconds: number; quizScore: number | null };
type Certificate = { id: string; score: number | null; issuedAt: string; formation: { title: string; category: string | null } };
type Resource = { id: string; name: string; category: string | null; documentType: string | null; fileUrl: string; aiSummary: string | null };

const CATEGORIES = ["Fiscalité", "Comptabilité", "Juridique", "Social", "Facturation électronique", "IA", "Organisation cabinet"];

const TYPE_ICON: Record<string, typeof PlayCircle> = {
  video: Video,
  webinar: Video,
  pdf: FileText,
  text: FileText,
  checklist: ListChecks,
  case_study: ListChecks,
  quiz: FileQuestion,
};

function allLessons(f: Formation) {
  return f.modules.flatMap((m) => m.lessons);
}

export function AcademyView() {
  const [tab, setTab] = useState<"dashboard" | "catalogue" | "ressources" | "certificats">("dashboard");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [openFormationId, setOpenFormationId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  async function loadAll() {
    const [f, p, lp, certs] = await Promise.all([
      fetch("/api/admin/academy/formations").then((r) => r.json()),
      fetch("/api/admin/academy/parcours").then((r) => r.json()),
      fetch("/api/academy/lesson-progress").then((r) => r.json()),
      fetch("/api/academy/certificates").then((r) => r.json()),
    ]);
    setFormations(Array.isArray(f) ? f.filter((x: Formation) => x.isPublished) : []);
    setParcoursList(Array.isArray(p) ? p : []);
    setLessonProgress(Array.isArray(lp) ? lp : []);
    setCertificates(Array.isArray(certs) ? certs : []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function progressOf(lessonId: string) {
    return lessonProgress.find((p) => p.lessonId === lessonId);
  }

  function formationCompletion(f: Formation) {
    const lessons = allLessons(f);
    if (lessons.length === 0) return 0;
    const done = lessons.filter((l) => progressOf(l.id)?.isCompleted).length;
    return Math.round((done / lessons.length) * 100);
  }

  const openFormation = formations.find((f) => f.id === openFormationId) ?? null;

  if (openFormation) {
    return (
      <LessonPlayer
        formation={openFormation}
        activeLessonId={activeLessonId}
        setActiveLessonId={setActiveLessonId}
        progressOf={progressOf}
        onClose={() => {
          setOpenFormationId(null);
          setActiveLessonId(null);
          loadAll();
        }}
        onProgressChange={loadAll}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([
          ["dashboard", "Mon tableau de bord"],
          ["catalogue", "Catalogue"],
          ["ressources", "Ressources"],
          ["certificats", "Certificats"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === key ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <DashboardTab
          formations={formations}
          completion={formationCompletion}
          onOpen={(id) => setOpenFormationId(id)}
        />
      )}

      {tab === "catalogue" && (
        <>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formations.map((f) => (
              <CourseCard key={f.id} formation={f} completion={formationCompletion(f)} onOpen={() => setOpenFormationId(f.id)} />
            ))}
            {formations.length === 0 && <p className="text-sm text-gray-400">Aucune formation disponible.</p>}
          </div>
        </>
      )}

      {tab === "ressources" && <ResourcesTab />}

      {tab === "certificats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((c) => (
            <div key={c.id} className="glass-panel rounded-2xl p-5">
              <Award size={20} className="text-amber-500 mb-2" />
              <h3 className="font-semibold text-sm">{c.formation.title}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Obtenu le {new Date(c.issuedAt).toLocaleDateString("fr-FR")}
                {c.score !== null ? ` · Score ${c.score}%` : ""}
              </p>
            </div>
          ))}
          {certificates.length === 0 && <p className="text-sm text-gray-400">Aucun certificat obtenu pour le moment.</p>}
        </div>
      )}
    </div>
  );
}

function CourseCard({ formation, completion, onOpen }: { formation: Formation; completion: number; onOpen: () => void }) {
  const moduleCount = formation.modules.length;
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      <div className="h-32 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
        {formation.coverImageUrl ? (
          <img src={formation.coverImageUrl} alt={formation.title} className="h-full w-full object-cover" />
        ) : (
          <PlayCircle size={36} className="text-brand/40" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-brand font-medium">{formation.category ?? "Général"}</p>
        <h3 className="font-semibold mt-1">{formation.title}</h3>
        <p className="text-xs text-gray-400 mt-1">
          {formation.level ?? "—"} · {moduleCount} module(s) · {formation.durationMinutes ?? "?"} min
        </p>
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand" style={{ width: `${completion}%` }} />
        </div>
        <button
          onClick={onOpen}
          className="mt-4 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          {completion > 0 ? "Continuer" : "Découvrir"}
        </button>
      </div>
    </div>
  );
}

function DashboardTab({
  formations,
  completion,
  onOpen,
}: {
  formations: Formation[];
  completion: (f: Formation) => number;
  onOpen: (id: string) => void;
}) {
  const inProgress = formations.filter((f) => completion(f) > 0 && completion(f) < 100);
  const recent = [...formations].slice(0, 4);
  const totalLessonsDone = formations.reduce((acc, f) => acc + Math.round((completion(f) / 100) * allLessons(f).length), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-gray-400">Formations en cours</p>
          <p className="text-2xl font-semibold mt-1">{inProgress.length}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-gray-400">Leçons validées</p>
          <p className="text-2xl font-semibold mt-1">{totalLessonsDone}</p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-xs text-gray-400">Formations disponibles</p>
          <p className="text-2xl font-semibold mt-1">{formations.length}</p>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Mes formations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((f) => (
              <CourseCard key={f.id} formation={f} completion={completion(f)} onOpen={() => onOpen(f.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Dernières nouveautés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.map((f) => (
            <CourseCard key={f.id} formation={f} completion={completion(f)} onOpen={() => onOpen(f.id)} />
          ))}
          {recent.length === 0 && <p className="text-sm text-gray-400">Aucune formation disponible.</p>}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    fetch(`/api/academy/resources?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setResources(Array.isArray(d) ? d : []));
  }, [query, category]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Rechercher une ressource..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategory(null)}
          className={`text-xs rounded-full px-3 py-1.5 ${!category ? "bg-brand text-white" : "bg-gray-100 text-gray-500"}`}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs rounded-full px-3 py-1.5 ${category === c ? "bg-brand text-white" : "bg-gray-100 text-gray-500"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((r) => (
          <a
            key={r.id}
            href={r.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="glass-panel rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition"
          >
            <FileText size={18} className="text-brand shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{r.name}</p>
              <p className="text-xs text-gray-400">{r.category ?? "—"}</p>
            </div>
          </a>
        ))}
        {resources.length === 0 && <p className="text-sm text-gray-400">Aucune ressource trouvée.</p>}
      </div>
    </div>
  );
}

function LessonPlayer({
  formation,
  activeLessonId,
  setActiveLessonId,
  progressOf,
  onClose,
  onProgressChange,
}: {
  formation: Formation;
  activeLessonId: string | null;
  setActiveLessonId: (id: string) => void;
  progressOf: (lessonId: string) => LessonProgress | undefined;
  onClose: () => void;
  onProgressChange: () => void;
}) {
  const lessons = useMemo(() => allLessons(formation), [formation]);
  const lesson = lessons.find((l) => l.id === activeLessonId) ?? lessons[0] ?? null;
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    setAiAnswer(null);
    setQuizAnswers({});
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div className="space-y-4">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand">
          <ArrowLeft size={16} /> Retour
        </button>
        <p className="text-sm text-gray-400">Cette formation ne contient pas encore de contenu.</p>
      </div>
    );
  }

  async function markCompleted(extra?: { quizScore?: number }) {
    await fetch("/api/academy/lesson-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson!.id, isCompleted: true, ...extra }),
    });
    onProgressChange();
  }

  async function askAI(action: string) {
    setAiLoading(true);
    setAiAnswer(null);
    const res = await fetch(`/api/academy/lessons/${lesson!.id}/ask-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setAiAnswer(data.answer);
    setAiLoading(false);
  }

  function submitQuiz() {
    const total = lesson!.quizQuestions.length;
    if (total === 0) return;
    let correct = 0;
    for (const q of lesson!.quizQuestions) {
      const chosen = quizAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (chosen && correctOption && chosen === correctOption.id) correct += 1;
    }
    const score = Math.round((correct / total) * 100);
    markCompleted({ quizScore: score });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
      <div className="space-y-3">
        <button onClick={onClose} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand">
          <ArrowLeft size={16} /> Retour
        </button>
        <h2 className="font-semibold">{formation.title}</h2>
        <div className="glass-panel rounded-2xl p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {formation.modules.map((m) => (
            <div key={m.id}>
              <p className="text-xs font-medium text-gray-400 uppercase px-2 mb-1">{m.title}</p>
              <div className="space-y-1">
                {m.lessons.map((l) => {
                  const Icon = TYPE_ICON[l.type] ?? FileText;
                  const done = progressOf(l.id)?.isCompleted;
                  const active = l.id === lesson.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActiveLessonId(l.id)}
                      className={`w-full flex items-center gap-2 text-left text-sm px-2 py-1.5 rounded-lg ${
                        active ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {done ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <Icon size={14} className="shrink-0" />}
                      <span className="truncate">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{lesson.title}</h3>
          <button
            onClick={() => askAI("summarize")}
            className="flex items-center gap-1.5 text-xs bg-brand/10 text-brand rounded-lg px-3 py-1.5 hover:bg-brand/20"
          >
            <Sparkles size={14} /> Demander à l&apos;IA
          </button>
        </div>

        {(lesson.type === "video" || lesson.type === "webinar") && lesson.videoUrl && (
          <video src={lesson.videoUrl} controls className="w-full rounded-xl bg-black" />
        )}

        {(lesson.type === "text" || lesson.type === "checklist" || lesson.type === "case_study") && (
          <div className="text-sm text-gray-600 whitespace-pre-wrap">{lesson.body}</div>
        )}

        {lesson.type === "pdf" && lesson.document && (
          <a
            href={lesson.document.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-brand bg-brand/10 rounded-xl px-4 py-2"
          >
            <Download size={16} /> Télécharger le PDF
          </a>
        )}

        {lesson.type === "quiz" && (
          <div className="space-y-4">
            {lesson.quizQuestions.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-medium mb-2">{q.question}</p>
                <div className="space-y-1">
                  {q.options.map((o) => (
                    <label key={o.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        checked={quizAnswers[q.id] === o.id}
                        onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: o.id })}
                      />
                      {o.text}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium">
              Valider le quiz
            </button>
          </div>
        )}

        {aiLoading && <p className="text-xs text-gray-400">L&apos;IA réfléchit...</p>}
        {aiAnswer && (
          <div className="bg-brand/5 border border-brand/10 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {aiAnswer}
          </div>
        )}

        {lesson.type !== "quiz" && (
          <button
            onClick={() => markCompleted()}
            disabled={progressOf(lesson.id)?.isCompleted}
            className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {progressOf(lesson.id)?.isCompleted ? "Leçon terminée" : "Marquer comme terminée"}
          </button>
        )}
      </div>
    </div>
  );
}
