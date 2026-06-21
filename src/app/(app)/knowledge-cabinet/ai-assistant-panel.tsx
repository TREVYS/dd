"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2, Globe } from "lucide-react";

type Exchange = {
  question: string;
  answer: string;
  sources: { id: string; title: string }[];
  webSources: { title: string; url: string }[];
};

export function AiAssistantPanel() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [useWeb, setUseWeb] = useState(false);
  const [history, setHistory] = useState<Exchange[]>([]);

  async function ask() {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setQuestion("");
    const res = await fetch("/api/knowledge/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, useWeb }),
    });
    const data = await res.json();
    setHistory((prev) => [
      ...prev,
      {
        question: q,
        answer: data.answer,
        sources: data.sources ?? [],
        webSources: data.webSources ?? [],
      },
    ]);
    setLoading(false);
  }

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center gap-1.5 text-sm font-semibold mb-3">
        <Sparkles size={16} className="text-brand" />
        Assistant IA — Knowledge Cabinet
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[28rem] mb-3">
        {history.length === 0 && (
          <p className="text-xs text-gray-400">
            Posez une question sur la fiscalité, la comptabilité, le social ou le juridique — l&apos;assistant
            répond en priorité à partir de la documentation interne validée du cabinet. Activez « Internet »
            pour compléter manuellement avec une recherche web.
          </p>
        )}
        {history.map((h, i) => (
          <div key={i} className="space-y-1.5">
            <p className="text-sm font-medium bg-gray-50 rounded-xl px-3 py-2">{h.question}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-brand/5 rounded-xl px-3 py-2">
              {h.answer}
            </p>
            {h.sources.length > 0 && (
              <p className="text-[11px] text-gray-400">
                Documentation interne : {h.sources.map((s) => s.title).join(", ")}
              </p>
            )}
            {h.webSources.length > 0 && (
              <p className="text-[11px] text-gray-400">
                Internet :{" "}
                {h.webSources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand hover:underline"
                  >
                    {s.title}
                    {idx < h.webSources.length - 1 ? ", " : ""}
                  </a>
                ))}
              </p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            {useWeb ? "Recherche interne + internet..." : "Recherche dans la documentation..."}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setUseWeb((v) => !v)}
        className={`flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 mb-2 self-start transition ${
          useWeb ? "bg-brand text-white" : "bg-gray-50 text-gray-500"
        }`}
      >
        <Globe size={12} />
        {useWeb ? "Internet activé" : "Rechercher aussi sur internet"}
      </button>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Votre question..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <button onClick={ask} disabled={loading} className="bg-brand text-white rounded-xl px-3 py-2 disabled:opacity-50">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
