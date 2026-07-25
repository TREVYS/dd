"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { name: string; ok: boolean; message: string };

// Zone de dépôt de la GED : glissez des fichiers (PDF, Word, images, ZIP…)
// — chacun est rangé automatiquement (base de connaissance ou médiathèque).
export function KnowledgeDropZone() {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Item[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const upload = async (files: FileList | File[] | null) => {
    if (!files || busy) return;
    const list = Array.from(files).slice(0, 15);
    if (!list.length) return;
    setBusy(true);
    for (const f of list) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        const r = await fetch("/api/admin/comms/upload", { method: "POST", body: fd });
        const d = await r.json();
        setResults((prev) => [
          { name: f.name, ok: r.ok, message: r.ok ? d.message : (d.error ?? "Échec.") },
          ...prev,
        ].slice(0, 12));
      } catch (e) {
        setResults((prev) => [{ name: f.name, ok: false, message: (e as Error).message }, ...prev].slice(0, 12));
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh(); // met à jour la liste des documents en dessous
  };

  return (
    <div>
      <div
        className={`adm-dropzone${over ? " over" : ""}${busy ? " busy" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.pptx,.txt,.md,.zip,image/*"
          style={{ display: "none" }}
          onChange={(e) => upload(e.target.files)}
        />
        {busy ? (
          <span><span className="adm-spin" style={{ borderColor: "var(--o-soft)", borderTopColor: "var(--o)" }} /> Alfred range vos fichiers…</span>
        ) : (
          <>
            <b>Glissez-déposez vos fichiers ici</b>
            <span className="muted" style={{ fontSize: ".82rem" }}>
              PDF, Word, PowerPoint, texte, images, ZIP — ou cliquez pour parcourir. Documents → base de
              connaissance · images → médiathèque · ZIP → déballé automatiquement.
            </span>
          </>
        )}
      </div>

      {results.length > 0 && (
        <ul style={{ margin: ".8rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: ".35rem" }}>
          {results.map((r, i) => (
            <li key={`${r.name}-${i}`} style={{ fontSize: ".84rem", color: r.ok ? "var(--ink2)" : "#c0392b" }}>
              {r.ok ? "✓" : "✗"} <b>{r.name}</b> — {r.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
