"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Clock,
  CheckCircle2,
  FolderPlus,
  Folder,
  Search,
  Sparkles,
  Send,
  Mail as MailIcon,
} from "lucide-react";

type Reply = {
  id: string;
  body: string;
  aiGenerated: boolean;
  createdAt: string;
  authorName: string;
};

type MailData = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: string;
  isRead: boolean;
  receivedAt: string;
  folderId: string | null;
  clientName: string | null;
  replies: Reply[];
};

type FolderData = { id: string; name: string };

const SMART_VIEWS = [
  { key: "all", label: "Boîte de réception", icon: Inbox },
  { key: "a_traiter", label: "À traiter", icon: Clock },
  { key: "traite", label: "Traités", icon: CheckCircle2 },
] as const;

export function MailClient({
  initialMails,
  initialFolders,
}: {
  initialMails: MailData[];
  initialFolders: FolderData[];
}) {
  const router = useRouter();
  const [mails, setMails] = useState(initialMails);
  const [folders, setFolders] = useState(initialFolders);
  const [view, setView] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialMails[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  const filtered = useMemo(() => {
    return mails.filter((m) => {
      if (view === "a_traiter" && m.status !== "a_traiter") return false;
      if (view === "traite" && m.status !== "traite") return false;
      if (view.startsWith("folder:")) {
        const folderId = view.slice("folder:".length);
        if (m.folderId !== folderId) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        return (
          m.subject.toLowerCase().includes(q) ||
          m.fromName.toLowerCase().includes(q) ||
          (m.clientName ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mails, view, query]);

  const selected = mails.find((m) => m.id === selectedId) ?? null;

  async function patchMail(id: string, data: Record<string, unknown>) {
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    await fetch(`/api/mails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }

  function selectMail(mail: MailData) {
    setSelectedId(mail.id);
    setReply("");
    setAiSuggested(false);
    if (!mail.isRead) {
      patchMail(mail.id, { isRead: true });
    }
  }

  async function handleCreateFolder() {
    const name = window.prompt("Nom du répertoire :");
    if (!name) return;
    const res = await fetch("/api/mail-folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((prev) => [...prev, folder]);
    }
  }

  async function handleMoveToFolder(folderId: string) {
    if (!selected) return;
    await patchMail(selected.id, { folderId });
  }

  async function handleAiSuggest() {
    if (!selected) return;
    setAiLoading(true);
    const res = await fetch(`/api/mails/${selected.id}/ai-draft`, { method: "POST" });
    const data = await res.json();
    setReply(data.draft ?? "");
    setAiSuggested(true);
    setAiLoading(false);
  }

  async function handleSendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/mails/${selected.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply, aiGenerated: aiSuggested }),
    });
    if (res.ok) {
      const newReply = await res.json();
      setMails((prev) =>
        prev.map((m) =>
          m.id === selected.id
            ? {
                ...m,
                status: "traite",
                isRead: true,
                replies: [
                  ...m.replies,
                  {
                    id: newReply.id,
                    body: newReply.body,
                    aiGenerated: newReply.aiGenerated,
                    createdAt: newReply.createdAt,
                    authorName: "Vous",
                  },
                ],
              }
            : m
        )
      );
      setReply("");
      setAiSuggested(false);
    }
    setSending(false);
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Folder rail */}
      <div className="w-56 shrink-0 bg-white rounded-2xl p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Vues</p>
        {SMART_VIEWS.map((v) => {
          const Icon = v.icon;
          const count =
            v.key === "all"
              ? mails.length
              : mails.filter((m) => m.status === v.key).length;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                view === v.key ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{v.label}</span>
              <span className={view === v.key ? "text-white/80" : "text-gray-400"}>{count}</span>
            </button>
          );
        })}

        <div className="flex items-center justify-between px-2 mt-4 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Répertoires</p>
          <button onClick={handleCreateFolder} className="text-gray-400 hover:text-brand">
            <FolderPlus size={15} />
          </button>
        </div>
        {folders.length === 0 && (
          <p className="text-xs text-gray-400 px-2">Aucun répertoire.</p>
        )}
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => setView(`folder:${f.id}`)}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              view === `folder:${f.id}` ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Folder size={16} />
            <span className="flex-1 text-left truncate">{f.name}</span>
          </button>
        ))}
      </div>

      {/* Mail list */}
      <div className="w-96 shrink-0 bg-white rounded-2xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-50">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un mail..."
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="p-6 text-sm text-gray-400">Aucun mail.</p>
          )}
          {filtered.map((mail) => (
            <button
              key={mail.id}
              onClick={() => selectMail(mail)}
              className={`w-full text-left p-4 transition ${
                selectedId === mail.id ? "bg-brand/5" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm truncate ${mail.isRead ? "text-gray-600" : "font-semibold"}`}>
                  {mail.fromName}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(mail.receivedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <p className={`text-sm truncate ${mail.isRead ? "text-gray-500" : "font-medium"}`}>
                {mail.subject}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {mail.status === "a_traiter" ? (
                  <span className="rounded-full bg-amber-50 text-amber-600 text-[11px] font-medium px-2 py-0.5">
                    À traiter
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium px-2 py-0.5">
                    Traité
                  </span>
                )}
                {mail.clientName && (
                  <span className="text-[11px] text-gray-400 truncate">{mail.clientName}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview pane */}
      <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
            <MailIcon size={32} />
            <p className="text-sm mt-2">Sélectionnez un mail</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{selected.subject}</h2>
                  <p className="text-sm text-gray-500">
                    {selected.fromName} · {selected.fromEmail}
                  </p>
                  {selected.clientName && (
                    <p className="text-xs text-gray-400">{selected.clientName}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(selected.receivedAt).toLocaleString("fr-FR")}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {selected.status === "a_traiter" ? (
                  <button
                    onClick={() => patchMail(selected.id, { status: "traite" })}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand"
                  >
                    <CheckCircle2 size={14} />
                    Marquer comme traité
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 size={14} />
                    Traité
                  </span>
                )}
                {folders.length > 0 && (
                  <select
                    value={selected.folderId ?? ""}
                    onChange={(e) => handleMoveToFolder(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 ml-auto"
                  >
                    <option value="">Déplacer vers...</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.body}</p>

              {selected.replies.map((r) => (
                <div key={r.id} className="rounded-xl bg-gray-50 p-3 ml-6">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    {r.authorName}
                    {r.aiGenerated && (
                      <span className="flex items-center gap-1 text-violet-500">
                        <Sparkles size={11} /> suggestion IA validée
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{r.body}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-50 space-y-2">
              <textarea
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  setAiSuggested(false);
                }}
                placeholder="Répondre..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none"
              />
              {aiSuggested && (
                <p className="text-xs text-violet-500 flex items-center gap-1">
                  <Sparkles size={12} /> Brouillon généré par l&apos;IA — relisez avant d&apos;envoyer.
                </p>
              )}
              <div className="flex justify-between">
                <button
                  onClick={handleAiSuggest}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 disabled:opacity-50"
                >
                  <Sparkles size={15} />
                  {aiLoading ? "Génération..." : "Suggestion IA"}
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !reply.trim()}
                  className="flex items-center gap-1.5 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  <Send size={15} />
                  {sending ? "Envoi..." : "Valider et envoyer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
