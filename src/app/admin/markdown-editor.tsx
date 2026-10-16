"use client";

import { useEffect, useRef, useState } from "react";
import { MediaPicker } from "./media-picker";
import {
  type Block,
  type BlockType,
  parseMarkdown,
  serializeBlocks,
  newBlock,
} from "./wysiwyg-blocks";

// Éditeur visuel (WYSIWYG) : l'utilisateur ne voit jamais de Markdown — du
// texte normal, mis en forme à l'écran (gras affiché gras, titres en grand,
// etc.). En coulisses, chaque bloc se sérialise dans le Markdown déjà utilisé
// partout (sites, newsletters, MDX) : aucun autre fichier du cockpit n'a
// besoin de changer, c'est un remplacement direct de l'ancien éditeur brut.
// La complexité (conversion, mise en forme) reste entièrement ici.

const BLOCK_LABEL: Record<BlockType, string> = {
  p: "Texte", h2: "Titre", h3: "Sous-titre", quote: "Citation",
  li: "Liste à puces", oli: "Liste numérotée", hr: "Séparateur",
  img: "Image", video: "Vidéo", tags: "Étiquette(s)",
};

const TEXT_TYPES: BlockType[] = ["p", "h2", "h3", "quote", "li", "oli"];

function BlockEditable({
  b,
  focused,
  onFocus,
  onInput,
  onEnter,
  onBackspaceEmpty,
}: {
  b: Block;
  focused: boolean;
  onFocus: () => void;
  onInput: (html: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Ne réécrit le DOM que si le contenu vient de l'extérieur (changement de
  // type, chargement initial) — jamais pendant la frappe (le curseur sauterait).
  const lastHtml = useRef(b.html);
  useEffect(() => {
    if (ref.current && b.html !== lastHtml.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = b.html ?? "";
    }
    lastHtml.current = b.html;
  }, [b.html]);

  const Tag = b.type === "h2" ? "h2" : b.type === "h3" ? "h3" : "div";
  const cls =
    b.type === "quote" ? "adm-wys-quote" :
    b.type === "li" ? "adm-wys-li" :
    b.type === "oli" ? "adm-wys-oli" :
    b.type === "h2" ? "adm-wys-h2" :
    b.type === "h3" ? "adm-wys-h3" : "adm-wys-p";

  return (
    <Tag
      ref={ref as never}
      className={`adm-wys-block ${cls}${focused ? " on" : ""}`}
      contentEditable
      suppressContentEditableWarning
      data-id={b.id}
      data-placeholder={b.type === "p" ? "Écrivez…" : undefined}
      onFocus={onFocus}
      onInput={(e) => onInput((e.target as HTMLElement).innerHTML)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
        else if (e.key === "Backspace") {
          const el = e.currentTarget;
          if (!el.textContent?.trim()) { e.preventDefault(); onBackspaceEmpty(); }
        }
      }}
      dangerouslySetInnerHTML={{ __html: b.html ?? "" }}
    />
  );
}

export function MarkdownEditor({
  name,
  defaultValue = "",
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseMarkdown(defaultValue));
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [instruction, setInstruction] = useState("");
  const [alfBusy, setAlfBusy] = useState(false);
  const [alfMsg, setAlfMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);

  const markdown = serializeBlocks(blocks);
  // Le champ réellement soumis avec le formulaire — identique à avant.
  // On déclenche aussi un évènement « input » : certaines pages (aperçu
  // d'e-mail en direct) écoutent la frappe sur ce champ pour se régénérer ;
  // sans ça, elles ne verraient jamais les modifications faites ici.
  const mounted = useRef(false);
  useEffect(() => {
    if (!hiddenRef.current) return;
    hiddenRef.current.value = markdown;
    if (mounted.current) hiddenRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    mounted.current = true;
  }, [markdown]);

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const insertAfter = (id: string | null, nb: Block) =>
    setBlocks((prev) => {
      const i = id ? prev.findIndex((b) => b.id === id) : prev.length - 1;
      const next = [...prev];
      next.splice(i + 1, 0, nb);
      return next;
    });

  const removeBlock = (id: string) =>
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));

  const setType = (id: string, type: BlockType) => update(id, { type });

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  };

  const insertLink = () => {
    const url = window.prompt("Lien (https://…) :");
    if (!url) return;
    exec("createLink", url);
  };

  const uploadImage = async (files: FileList | null, pos?: "droite" | "gauche") => {
    if (!files || !files.length) return;
    setErr(""); setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("file", f));
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const items: { url: string; name: string }[] = d.items ?? (d.item ? [d.item] : []);
      for (const it of items) {
        insertAfter(focusId, { id: `img${Date.now()}${Math.random()}`, type: "img", imageUrl: it.url, imageAlt: it.name, imagePos: pos });
      }
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadAttachment = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const it = (d.items ?? [])[0];
      if (it) {
        const b = newBlock("p");
        b.html = `<a href="${it.url}">${it.name}</a>`;
        insertAfter(focusId, b);
      }
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
    if (attachRef.current) attachRef.current.value = "";
  };

  const insertVideo = () => {
    const input = window.prompt("Collez le lien YouTube (ou l'identifiant de la vidéo) :");
    if (!input) return;
    const s = input.trim();
    const id = /^[A-Za-z0-9_-]{11}$/.test(s)
      ? s
      : s.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/)?.[1];
    if (!id) { setErr("Lien YouTube non reconnu."); return; }
    setErr("");
    insertAfter(focusId, { id: `v${Date.now()}`, type: "video", videoId: id });
  };

  const insertTags = () => {
    const input = window.prompt("Étiquette(s), séparées par une virgule (ex. Consulting) :");
    if (!input) return;
    const tags = input.split(",").map((t) => t.trim()).filter(Boolean);
    if (!tags.length) return;
    insertAfter(focusId, { id: `t${Date.now()}`, type: "tags", tags });
  };

  const askAlfred = async (instr?: string) => {
    const order = (instr ?? instruction).trim();
    if (!order) return;
    setAlfBusy(true); setAlfMsg("");
    try {
      const r = await fetch("/api/admin/comms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown, instruction: order }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Alfred n'a pas pu répondre.");
      setBlocks(parseMarkdown(d.content ?? markdown));
      setInstruction("");
      setAlfMsg("Contenu mis à jour par Alfred. Relisez avant d'enregistrer.");
    } catch (e) { setAlfMsg((e as Error).message); }
    setAlfBusy(false);
  };

  const QUICK = [
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
        <button type="button" className="adm-md-tool" title="Gras" onClick={() => exec("bold")}><b>B</b></button>
        <button type="button" className="adm-md-tool" title="Italique" onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className="adm-md-tool" title="Lien" onClick={insertLink}>🔗 Lien</button>
        <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "0 .2rem" }} />
        {(["h2", "h3", "quote", "li", "oli"] as BlockType[]).map((t) => (
          <button
            key={t}
            type="button"
            className="adm-md-tool"
            title={BLOCK_LABEL[t]}
            onClick={() => focusId && setType(focusId, t)}
            disabled={!focusId}
          >
            {t === "h2" ? "H2" : t === "h3" ? "H3" : t === "quote" ? "❝ Citation" : t === "li" ? "• Liste" : "1. Liste"}
          </button>
        ))}
        <button type="button" className="adm-md-tool" title="Paragraphe normal" onClick={() => focusId && setType(focusId, "p")} disabled={!focusId}>¶</button>
        <button type="button" className="adm-md-tool" title="Ligne de séparation" onClick={() => insertAfter(focusId, newBlock("hr"))}>— Séparateur</button>
        <span style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "0 .2rem" }} />
        <button type="button" className="adm-md-tool img" title="Importer une image" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Import…" : "Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden multiple onChange={(e) => uploadImage(e.target.files)} />
        <button type="button" className="adm-md-tool img" title="Choisir une image dans la médiathèque" onClick={() => setPick(true)}>🗂 Médiathèque</button>
        <button type="button" className="adm-md-tool img" title="Insérer une vidéo YouTube" onClick={insertVideo}>▶ Vidéo</button>
        <button type="button" className="adm-md-tool img" title="Joindre un document" onClick={() => attachRef.current?.click()} disabled={busy}>Pièce jointe</button>
        <input ref={attachRef} type="file" accept="application/pdf,image/*" hidden onChange={(e) => uploadAttachment(e.target.files)} />
        <button type="button" className="adm-md-tool img" title="Étiquette(s) (ex. pour la newsletter)" onClick={insertTags}>🏷 Étiquette</button>
      </div>
      {err && <p style={{ color: "#c0392b", fontSize: ".8rem", margin: ".4rem 0 0" }}>{err}</p>}

      <div className="adm-wys">
        {blocks.length === 0 && <p className="muted">{placeholder}</p>}
        {blocks.map((b) => {
          if (b.type === "hr") {
            return (
              <div key={b.id} className="adm-wys-block adm-wys-hr-row" onClick={() => setFocusId(b.id)}>
                <hr />
                <button type="button" className="adm-wys-rm" title="Supprimer" onClick={() => removeBlock(b.id)}>×</button>
              </div>
            );
          }
          if (b.type === "img") {
            return (
              <div key={b.id} className="adm-wys-block adm-wys-chip" onClick={() => setFocusId(b.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt={b.imageAlt ?? ""} style={{ maxWidth: 160, maxHeight: 100, borderRadius: 8, objectFit: "cover" }} />
                <span className="muted" style={{ fontSize: ".82rem" }}>Image{b.imagePos ? ` (vignette, ${b.imagePos})` : ""}</span>
                <button type="button" className="adm-wys-rm" title="Supprimer" onClick={() => removeBlock(b.id)}>×</button>
              </div>
            );
          }
          if (b.type === "video") {
            return (
              <div key={b.id} className="adm-wys-block adm-wys-chip" onClick={() => setFocusId(b.id)}>
                <span>▶ Vidéo YouTube — {b.videoId}</span>
                <button type="button" className="adm-wys-rm" title="Supprimer" onClick={() => removeBlock(b.id)}>×</button>
              </div>
            );
          }
          if (b.type === "tags") {
            return (
              <div key={b.id} className="adm-wys-block adm-wys-chip" onClick={() => setFocusId(b.id)}>
                {(b.tags ?? []).map((t) => <span key={t} className="adm-tag ck-tag-metier" data-metier={t}>{t}</span>)}
                <button type="button" className="adm-wys-rm" title="Supprimer" onClick={() => removeBlock(b.id)}>×</button>
              </div>
            );
          }
          return (
            <BlockEditable
              key={b.id}
              b={b}
              focused={focusId === b.id}
              onFocus={() => setFocusId(b.id)}
              onInput={(html) => update(b.id, { html })}
              onEnter={() => {
                const nb = newBlock(b.type === "h2" || b.type === "h3" ? "p" : b.type);
                insertAfter(b.id, nb);
                requestAnimationFrame(() => {
                  const el = document.querySelector<HTMLElement>(`[data-id="${nb.id}"]`);
                  el?.focus();
                });
                setFocusId(nb.id);
              }}
              onBackspaceEmpty={() => removeBlock(b.id)}
            />
          );
        })}
      </div>

      <textarea ref={hiddenRef} name={name} defaultValue={markdown} hidden readOnly />

      <div className="ck-alfred-quick">
        {QUICK.map((q) => (
          <button key={q.label} type="button" className="ck-chip" onClick={() => askAlfred(q.instr)} disabled={alfBusy}>
            {q.label}
          </button>
        ))}
      </div>

      <div className="ck-alfred-bar">
        <span className="ck-alfred-ic" aria-hidden="true">✦</span>
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); askAlfred(); } }}
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
        onPick={(u, n) => { insertAfter(focusId, { id: `img${Date.now()}`, type: "img", imageUrl: u, imageAlt: n }); setPick(false); }}
      />
    </div>
  );
}
