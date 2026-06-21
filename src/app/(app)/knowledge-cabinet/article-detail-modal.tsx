"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, Trash2 } from "lucide-react";

type Article = {
  id: string;
  title: string;
  category: string | null;
  content: string;
  status: string;
  creatorName: string | null;
};

export function ArticleDetailModal({
  article,
  isPartner,
  onClose,
}: {
  article: Article;
  isPartner: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function validate() {
    setBusy(true);
    await fetch(`/api/knowledge/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "validee" }),
    });
    setBusy(false);
    onClose();
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Supprimer l'article « ${article.title} » ?`)) return;
    await fetch(`/api/knowledge/${article.id}`, { method: "DELETE" });
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium text-brand bg-brand/10 rounded-full px-2 py-0.5">
              {article.category ?? "Non classé"}
            </span>
            <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
            <p className="text-xs text-gray-400">
              {article.creatorName ?? "Auteur inconnu"} ·{" "}
              {article.status === "validee" ? "Validé" : "Brouillon"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm whitespace-pre-wrap text-gray-700">{article.content}</p>

        <div className="flex items-center justify-between pt-2">
          <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500">
            <Trash2 size={13} />
            Supprimer
          </button>
          {article.status !== "validee" && isPartner && (
            <button
              onClick={validate}
              disabled={busy}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 rounded-xl px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {busy ? "Validation..." : "Valider l'article"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
