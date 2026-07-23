"use client";

import { useRef, useState } from "react";
import { mdToHtml } from "@/lib/md-preview";
import { MediaPicker } from "./media-picker";

type Btn = { label: string; title: string; wrap?: [string, string]; block?: string };

type Btn2 = Btn & { insert?: string };

const TOOLS: Btn2[] = [
  { label: "H2", title: "Titre de section", block: "## " },
  { label: "H3", title: "Sous-titre", block: "### " },
  { label: "B", title: "Gras", wrap: ["**", "**"] },
  { label: "I", title: "Italique", wrap: ["*", "*"] },
  { label: "• Liste", title: "Liste à puces", block: "- " },
  { label: "1. Liste", title: "Liste numérotée", block: "1. " },
  { label: "❝ Citation", title: "Citation", block: "> " },
  { label: "🔗 Lien", title: "Insérer un lien", wrap: ["[", "](https://)"] },
  { label: "— Séparateur", title: "Ligne de séparation", insert: "\n\n---\n\n" },
];

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [alfBusy, setAlfBusy] = useState(false);
  const [alfMsg, setAlfMsg] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  // Applique une transformation autour de la sélection courante.
  const surround = (b: Btn2) => {
    const el = ta.current;
    if (!el) return;
    if (b.insert) {
      insertAtCursor(b.insert);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end);
    let next: string;
    let caret: number;
    if (b.wrap) {
      const [l, r] = b.wrap;
      next = value.slice(0, start) + l + sel + r + value.slice(end);
      caret = start + l.length + sel.length + r.length;
    } else {
      const p = b.block ?? "";
      // Appliquer le préfixe en début de ligne.
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + p + value.slice(lineStart);
      caret = end + p.length;
    }
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const insertAtCursor = (text: string) => {
    const el = ta.current;
    const pos = el ? el.selectionStart : value.length;
    const next = value.slice(0, pos) + text + value.slice(pos);
    setValue(next);
  };

  const uploadImage = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("file", f));
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const items: { url: string; name: string }[] = d.items ?? (d.item ? [d.item] : []);
      const md = items.map((it) => `\n\n![${it.name}](${it.url})\n`).join("");
      insertAtCursor(md);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Importe une pièce jointe (PDF, doc…) et insère un lien de téléchargement.
  const uploadAttachment = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const it = (d.items ?? [])[0];
      if (it) insertAtCursor(`\n\n[📎 ${it.name}](${it.url})\n`);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
    if (attachRef.current) attachRef.current.value = "";
  };

  // Insère une vidéo YouTube (balise <YouTube id="…" /> reconnue par le site).
  const insertVideo = () => {
    const input = window.prompt("Collez le lien YouTube (ou l'identifiant de la vidéo) :");
    if (!input) return;
    const s = input.trim();
    const id = /^[A-Za-z0-9_-]{11}$/.test(s)
      ? s
      : s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/)?.[1];
    if (!id) {
      setErr("Lien YouTube non reconnu.");
      return;
    }
    setErr("");
    insertAtCursor(`\n\n<YouTube id="${id}" />\n\n`);
  };

  // Demande à Alfred de modifier le contenu selon une instruction.
  const askAlfred = async (instr?: string) => {
    const order = (instr ?? instruction).trim();
    if (!order) return;
    setAlfBusy(true);
    setAlfMsg("");
    try {
      const r = await fetch("/api/admin/comms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value, instruction: order }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Alfred n'a pas pu répondre.");
      setValue(d.content ?? value);
      setInstruction("");
      setAlfMsg("Contenu mis à jour par Alfred. Relisez avant d'enregistrer.");
    } catch (e) {
      setAlfMsg((e as Error).message);
    }
    setAlfBusy(false);
  };

  const QUICK: { label: string; instr: string }[] = [
    { label: "Améliorer le style", instr: "Améliore le style et la fluidité sans changer le sens ni la structure." },
    { label: "Corriger", instr: "Corrige l'orthographe, la grammaire et la ponctuation." },
    { label: "Raccourcir", instr: "Raccourcis le texte en gardant les idées essentielles." },
    { label: "Plus percutant", instr: "Rends le texte plus percutant et incarné, ton direct." },
    { label: "Ajouter une conclusion", instr: "Ajoute une courte conclusion avec un appel à l'action." },
    { label: "Optimiser SEO", instr: "Optimise pour le référencement : titres clairs, mots-clés naturels, chapô." },
  ];

  return (
    <div className="adm-md">
      <div className="adm-md-toolbar">
        {TOOLS.map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.title}
            className="adm-md-tool"
            onClick={() => surround(b)}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          className="adm-md-tool img"
          title="Importer une image dans l'article (hébergée sur votre instance)"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Import…" : "🖼 Image"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          multiple
          onChange={(e) => uploadImage(e.target.files)}
        />
        <button
          type="button"
          className="adm-md-tool img"
          title="Choisir une image dans la médiathèque"
          onClick={() => setPick(true)}
        >
          🗂 Médiathèque
        </button>
        <button
          type="button"
          className="adm-md-tool img"
          title="Insérer une vidéo YouTube"
          onClick={insertVideo}
        >
          ▶ Vidéo
        </button>
        <button
          type="button"
          className="adm-md-tool img"
          title="Joindre un document (PDF, etc.)"
          onClick={() => attachRef.current?.click()}
          disabled={busy}
        >
          📎 Pièce jointe
        </button>
        <input
          ref={attachRef}
          type="file"
          accept="application/pdf,image/*"
          hidden
          onChange={(e) => uploadAttachment(e.target.files)}
        />
        <div className="adm-md-tabs">
          <button type="button" className={tab === "write" ? "on" : ""} onClick={() => setTab("write")}>Écrire</button>
          <button type="button" className={tab === "preview" ? "on" : ""} onClick={() => setTab("preview")}>Aperçu</button>
        </div>
      </div>
      {err && <p style={{ color: "#c0392b", fontSize: ".8rem", margin: ".4rem 0 0" }}>{err}</p>}
      <div className={`adm-md-panes ${tab}`}>
        <textarea
          ref={ta}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onDrop={(e) => {
            if (e.dataTransfer.files.length) {
              e.preventDefault();
              uploadImage(e.dataTransfer.files);
            }
          }}
        />
        <div className="adm-md-preview mkt">
          <div className="mkt-article" dangerouslySetInnerHTML={{ __html: mdToHtml(value) || "<p style='color:#9b8f7c'>L’aperçu s’affichera ici…</p>" }} />
        </div>
      </div>

      {/* Actions rapides Alfred (un clic) */}
      <div className="ck-alfred-quick">
        {QUICK.map((q) => (
          <button key={q.label} type="button" className="ck-chip" onClick={() => askAlfred(q.instr)} disabled={alfBusy}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Barre Alfred : donner une instruction pour modifier le contenu */}
      <div className="ck-alfred-bar">
        <span className="ck-alfred-ic" aria-hidden="true">✦</span>
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              askAlfred();
            }
          }}
          placeholder="Demandez à Alfred : « raccourcis l'intro », « ajoute une conclusion », « ton plus direct »…"
          disabled={alfBusy}
        />
        <button type="button" className="adm-btn sm" onClick={() => askAlfred()} disabled={alfBusy || !instruction.trim()}>
          {alfBusy ? "Alfred écrit…" : "Demander à Alfred"}
        </button>
      </div>
      {alfMsg && <p style={{ fontSize: ".82rem", margin: ".5rem 0 0", color: alfMsg.startsWith("Contenu") ? "#2E9E6B" : "#c0392b" }}>{alfMsg}</p>}

      <MediaPicker
        open={pick}
        onClose={() => setPick(false)}
        onPick={(u, n) => insertAtCursor(`\n\n![${n}](${u})\n`)}
      />
    </div>
  );
}
