"use client";

import { useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string; actions?: string[] };

const SUGGESTIONS = [
  "Propose-moi un calendrier éditorial pour le mois prochain.",
  "Rédige un article sur la réforme de la facturation électronique.",
  "Décline le dernier article en post LinkedIn.",
  "Quelles idées de contenus pour attirer des DAF ?",
];

export function CommsChat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Trombone : envoie un fichier à Alfred (image → médiathèque,
  // document → base de connaissance) et l'annonce dans la conversation.
  const sendFile = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    const f = files[0];
    setUploading(true);
    setTurns((t) => [...t, { role: "user", content: `📎 ${f.name}` }]);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/admin/comms/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'envoi.");
      setTurns((t) => [...t, { role: "assistant", content: d.message }]);
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", content: (e as Error).message }]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 50);
  };

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    const next = [...turns, { role: "user" as const, content: msg }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/admin/comms/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: next.map((t) => ({ role: t.role, content: t.content })) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Erreur");
      setTurns((t) => [...t, { role: "assistant", content: d.reply, actions: d.actions }]);
    } catch (e) {
      setTurns((t) => [...t, { role: "assistant", content: `${(e as Error).message}` }]);
    }
    setBusy(false);
    setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 50);
  };

  return (
    <div className="adm-chat">
      <div className="adm-chat-log" ref={scrollRef}>
        {turns.length === 0 && (
          <div className="adm-chat-empty">
            <div className="adm-chat-ava">🎩</div>
            <p style={{ fontWeight: 700, margin: ".6rem 0 .2rem" }}>Bonjour John, je suis Alfred</p>
            <p style={{ color: "var(--ink2)", fontSize: ".9rem", maxWidth: 460 }}>
              Votre directeur de communication. Je peux <b>rédiger des articles</b>,
              <b> planifier</b> vos publications et proposer un <b>calendrier éditorial</b>,
              dans votre style. Éduquez-moi via « Éduquer Alfred » pour que j&apos;écrive comme vous.
            </p>
            <div className="adm-chat-sugg">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={`adm-msg ${t.role}`}>
            {t.role === "assistant" && <div className="adm-msg-ava">A</div>}
            <div className="adm-msg-body">
              {t.content.split("\n").map((line, j) => (
                <p key={j} style={{ margin: line ? "0 0 .5rem" : 0 }}>{line}</p>
              ))}
              {t.actions && t.actions.length > 0 && (
                <div className="adm-msg-actions">
                  {t.actions.map((a, k) => (
                    <span key={k}>✓ {a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="adm-msg assistant">
            <div className="adm-msg-ava">A</div>
            <div className="adm-msg-body" style={{ color: "var(--ink3)" }}>Le directeur réfléchit…</div>
          </div>
        )}
      </div>

      <form
        className="adm-chat-bar"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,.zip,image/*"
          style={{ display: "none" }}
          onChange={(e) => sendFile(e.target.files)}
        />
        <button
          type="button"
          className="adm-chat-clip"
          title="Transmettre un fichier à Alfred (image, PDF, Word…)"
          aria-label="Joindre un fichier"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <span className="adm-spin" style={{ margin: 0, borderColor: "var(--o-soft)", borderTopColor: "var(--o)" }} />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.4 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.4 17.4a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          )}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Demandez un article, un post… ou transmettez un fichier 📎"
          disabled={busy}
        />
        <button className="adm-btn" type="submit" disabled={busy || !input.trim()}>
          Envoyer
        </button>
      </form>
    </div>
  );
}
