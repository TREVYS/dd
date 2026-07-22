"use client";

import { useRef, useState } from "react";
import { mdToHtml } from "@/lib/md-preview";

type Btn = { label: string; title: string; wrap?: [string, string]; block?: string };

const TOOLS: Btn[] = [
  { label: "H2", title: "Titre de section", block: "## " },
  { label: "H3", title: "Sous-titre", block: "### " },
  { label: "B", title: "Gras", wrap: ["**", "**"] },
  { label: "I", title: "Italique", wrap: ["*", "*"] },
  { label: "• Liste", title: "Liste à puces", block: "- " },
  { label: "❝ Citation", title: "Citation", block: "> " },
  { label: "🔗 Lien", title: "Insérer un lien", wrap: ["[", "](https://)"] },
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
  const ta = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Applique une transformation autour de la sélection courante.
  const surround = (b: Btn) => {
    const el = ta.current;
    if (!el) return;
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
    </div>
  );
}
