"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MediaPicker } from "./media-picker";
import {
  type Block,
  type BlockType,
  parseMarkdown,
  serializeBlocks,
  newBlock,
  htmlToMarkdown,
} from "./wysiwyg-blocks";

// Éditeur visuel (WYSIWYG) : l'utilisateur ne voit jamais de Markdown — du
// texte normal, mis en forme à l'écran (gras affiché gras, titres en grand,
// etc.). En coulisses, chaque bloc se sérialise dans le Markdown déjà utilisé
// partout (sites, newsletters, MDX) : aucun autre fichier du cockpit n'a
// besoin de changer. La complexité (conversion, mise en forme) reste ici.
//
// Comportement « traitement de texte » : Entrée coupe le paragraphe à
// l'endroit du curseur, Retour arrière en début de ligne le recolle au
// précédent, les flèches passent d'un bloc à l'autre, un texte collé (Word,
// Google Docs, page web, ChatGPT) est découpé en paragraphes/titres/listes
// propres, chaque bloc se déplace ou se supprime, et « Annuler » revient en
// arrière (y compris après une réécriture par Alfred).

const BLOCK_LABEL: Record<BlockType, string> = {
  p: "Texte", h2: "Titre", h3: "Sous-titre", quote: "Citation",
  li: "Liste à puces", oli: "Liste numérotée", hr: "Séparateur",
  img: "Image", video: "Vidéo", tags: "Étiquette(s)",
};

const isText = (t: BlockType) => t === "p" || t === "h2" || t === "h3" || t === "quote" || t === "li" || t === "oli";

// --- Curseur ---------------------------------------------------------------
function caretInfo(el: HTMLElement): { atStart: boolean; atEnd: boolean } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed || !el.contains(sel.anchorNode)) return { atStart: false, atEnd: false };
  const r = sel.getRangeAt(0);
  const before = document.createRange();
  before.selectNodeContents(el);
  before.setEnd(r.startContainer, r.startOffset);
  const after = document.createRange();
  after.selectNodeContents(el);
  after.setStart(r.endContainer, r.endOffset);
  return { atStart: before.toString().length === 0, atEnd: after.toString().length === 0 };
}

// Place le curseur à N caractères du début (ou à la fin si N est absent).
function placeCaret(el: HTMLElement, offset?: number) {
  el.focus();
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  if (offset === undefined) {
    r.selectNodeContents(el);
    r.collapse(false);
  } else {
    let left = offset;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    let placed = false;
    while (node) {
      const len = node.textContent?.length ?? 0;
      if (left <= len) { r.setStart(node, left); placed = true; break; }
      left -= len;
      node = walker.nextNode();
    }
    if (!placed) { r.selectNodeContents(el); r.collapse(false); } else r.collapse(true);
  }
  sel.removeAllRanges();
  sel.addRange(r);
}

function BlockEditable({
  b,
  focused,
  placeholder,
  onFocus,
  onInput,
  onKey,
  onPaste,
}: {
  b: Block;
  focused: boolean;
  placeholder?: string;
  onFocus: () => void;
  onInput: (html: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLElement>) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  // Le contenu n'est écrit dans la page qu'au montage, puis seulement s'il
  // change de l'extérieur (fusion de blocs…) — jamais pendant la frappe,
  // sinon le curseur sauterait au début à chaque lettre.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== (b.html ?? "")) el.innerHTML = b.html ?? "";
    // b.type en dépendance : changer de type (texte → titre) remplace la
    // balise à l'écran, il faut y remettre le contenu.
  }, [b.html, b.type]);

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
      data-placeholder={placeholder}
      onFocus={onFocus}
      onInput={(e) => onInput((e.target as HTMLElement).innerHTML)}
      onKeyDown={onKey}
      onPaste={onPaste}
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
  const [blocks, setBlocksState] = useState<Block[]>(() => parseMarkdown(defaultValue, true));
  const [focusId, setFocusId] = useState<string | null>(null);
  // « Époque » : incrémentée quand tout le contenu est remplacé (annulation,
  // réécriture par Alfred) pour reconstruire proprement chaque bloc à l'écran.
  const [epoch, setEpoch] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [pick, setPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [instruction, setInstruction] = useState("");
  const [alfBusy, setAlfBusy] = useState(false);
  const [alfMsg, setAlfMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Copie toujours à jour des blocs (les gestionnaires clavier en ont besoin
  // immédiatement, sans attendre le prochain rendu).
  const blocksRef = useRef(blocks);
  const setBlocks = (next: Block[]) => { blocksRef.current = next; setBlocksState(next); };

  // Historique pour « Annuler » : une photo avant chaque changement de
  // structure et à chaque entrée dans un bloc.
  const history = useRef<string[]>([]);
  const snapshot = () => {
    const snap = JSON.stringify(blocksRef.current);
    const h = history.current;
    if (h[h.length - 1] === snap) return;
    h.push(snap);
    if (h.length > 60) h.shift();
    setCanUndo(true);
  };
  const undo = () => {
    const h = history.current;
    const cur = JSON.stringify(blocksRef.current);
    let snap = h.pop();
    while (snap !== undefined && snap === cur) snap = h.pop();
    if (snap === undefined) { setCanUndo(false); return; }
    setBlocks(JSON.parse(snap) as Block[]);
    setEpoch((e) => e + 1);
    setCanUndo(h.length > 0);
  };

  const markdown = serializeBlocks(blocks);
  // Le champ réellement soumis avec le formulaire. On déclenche aussi un
  // évènement « input » : certaines pages (aperçu d'e-mail en direct, barre
  // d'enregistrement) écoutent ce champ pour suivre les modifications.
  const mounted = useRef(false);
  useEffect(() => {
    if (!hiddenRef.current) return;
    hiddenRef.current.value = markdown;
    if (mounted.current) hiddenRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    mounted.current = true;
  }, [markdown]);

  const elOf = (id: string) => rootRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`) ?? null;
  const focusBlock = (id: string, offset?: number) => {
    // Applique tout de suite les changements en attente : le bloc visé existe
    // alors déjà à l'écran et reçoit le curseur sans délai (aucune frappe perdue).
    flushSync(() => setFocusId(id));
    const go = () => {
      const el = elOf(id);
      if (!el) return;
      if (el.isContentEditable) placeCaret(el, offset);
      else el.scrollIntoView({ block: "nearest" });
    };
    go();
  };

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks(blocksRef.current.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const insertAfter = (id: string | null, nbs: Block[]) => {
    snapshot();
    const cur = blocksRef.current;
    const i = id ? cur.findIndex((b) => b.id === id) : cur.length - 1;
    const next = [...cur];
    next.splice((i < 0 ? cur.length - 1 : i) + 1, 0, ...nbs);
    setBlocks(next);
  };

  const removeBlock = (id: string) => {
    const cur = blocksRef.current;
    const i = cur.findIndex((b) => b.id === id);
    if (i < 0) return;
    snapshot();
    const next = cur.filter((b) => b.id !== id);
    if (next.length === 0) next.push(newBlock("p"));
    setBlocks(next);
    const neighbour = next[Math.max(0, i - 1)];
    if (neighbour) focusBlock(neighbour.id);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const cur = blocksRef.current;
    const i = cur.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return;
    snapshot();
    const next = [...cur];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
    setFocusId(id);
  };

  const setType = (id: string, type: BlockType) => {
    const b = blocksRef.current.find((x) => x.id === id);
    if (!b || !isText(b.type)) return;
    snapshot();
    // Recliquer sur le type déjà actif revient au texte normal.
    update(id, { type: b.type === type && type !== "p" ? "p" : type });
    focusBlock(id);
  };

  // --- Clavier : Entrée, Retour arrière, flèches ----------------------------
  const onKey = (b: Block) => (e: React.KeyboardEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const cur = blocksRef.current;
    const i = cur.findIndex((x) => x.id === b.id);
    const type = cur[i]?.type ?? b.type;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Ligne de liste vide + Entrée : on sort de la liste.
      if ((type === "li" || type === "oli" || type === "quote") && !el.textContent?.trim()) {
        snapshot();
        update(b.id, { type: "p" });
        return;
      }
      snapshot();
      // Coupe le bloc à l'endroit du curseur : la suite part dans un nouveau bloc.
      const sel = window.getSelection();
      let afterHtml = "";
      if (sel && sel.rangeCount && el.contains(sel.anchorNode)) {
        const r = sel.getRangeAt(0);
        r.deleteContents();
        const tail = document.createRange();
        tail.selectNodeContents(el);
        tail.setStart(r.endContainer, r.endOffset);
        const holder = document.createElement("div");
        holder.appendChild(tail.extractContents());
        afterHtml = holder.textContent?.length ? holder.innerHTML : "";
      }
      const beforeHtml = el.textContent?.length ? el.innerHTML : "";
      if (!beforeHtml) el.innerHTML = "";
      const nb = newBlock(type === "h2" || type === "h3" ? "p" : type);
      nb.html = afterHtml;
      const next = cur.map((x) => (x.id === b.id ? { ...x, html: beforeHtml } : x));
      next.splice(i + 1, 0, nb);
      setBlocks(next);
      focusBlock(nb.id, 0);
      return;
    }

    if (e.key === "Backspace") {
      const { atStart } = caretInfo(el);
      if (!atStart) return;
      e.preventDefault();
      // En début de titre / liste / citation : redevient du texte normal.
      if (type !== "p") { snapshot(); update(b.id, { type: "p" }); return; }
      const prev = cur[i - 1];
      if (!prev) return;
      snapshot();
      if (!isText(prev.type)) {
        // Bloc précédent non textuel (image, séparateur…) : on le retire
        // seulement si la ligne courante est vide, sinon on le sélectionne.
        if (!el.textContent?.trim() && cur.length > 1) removeBlock(b.id);
        else setFocusId(prev.id);
        return;
      }
      const prevEl = elOf(prev.id);
      const at = prevEl?.textContent?.length ?? 0;
      const merged = `${(prev.html ?? "").replace(/(<br\s*\/?>)+$/i, "")}${el.innerHTML}`;
      setBlocks(cur.filter((x) => x.id !== b.id).map((x) => (x.id === prev.id ? { ...x, html: merged } : x)));
      focusBlock(prev.id, at);
      return;
    }

    if (e.key === "Delete") {
      const { atEnd } = caretInfo(el);
      const nextB = cur[i + 1];
      if (!atEnd || !nextB || !isText(nextB.type)) return;
      e.preventDefault();
      snapshot();
      const at = el.textContent?.length ?? 0;
      const merged = `${el.innerHTML.replace(/(<br\s*\/?>)+$/i, "")}${nextB.html ?? ""}`;
      el.innerHTML = merged;
      setBlocks(cur.filter((x) => x.id !== nextB.id).map((x) => (x.id === b.id ? { ...x, html: merged } : x)));
      focusBlock(b.id, at);
      return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      const prev = cur[i - 1];
      if (prev && caretInfo(el).atStart) { e.preventDefault(); focusBlock(prev.id); }
    } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      const nextB = cur[i + 1];
      if (nextB && caretInfo(el).atEnd) { e.preventDefault(); focusBlock(nextB.id, 0); }
    }
  };

  // --- Coller : texte propre, découpé en blocs ------------------------------
  const onPaste = (b: Block) => (e: React.ClipboardEvent<HTMLElement>) => {
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");
    if (!html && !plain) return;
    e.preventDefault();
    const md = (html ? htmlToMarkdown(html) : "") || plain.replace(/\r\n/g, "\n");
    const pasted = parseMarkdown(md.trim());
    if (pasted.length === 0) return;
    // Un seul paragraphe : inséré dans la ligne, à l'endroit du curseur.
    if (pasted.length === 1 && pasted[0].type === "p") {
      document.execCommand("insertHTML", false, pasted[0].html ?? "");
      return;
    }
    // Plusieurs blocs : insérés à la suite (le bloc courant est remplacé s'il est vide).
    const el = e.currentTarget;
    const empty = !el.textContent?.trim();
    snapshot();
    const cur = blocksRef.current;
    const i = cur.findIndex((x) => x.id === b.id);
    const next = [...cur];
    next.splice(empty ? i : i + 1, empty ? 1 : 0, ...pasted);
    setBlocks(next);
    focusBlock(pasted[pasted.length - 1].id);
  };

  // --- Mise en forme --------------------------------------------------------
  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    const id = focusId;
    const el = id ? elOf(id) : null;
    if (id && el?.isContentEditable) update(id, { html: el.innerHTML });
  };

  const insertLink = () => {
    const sel = window.getSelection();
    const anchor = sel?.anchorNode?.parentElement?.closest("a");
    if (anchor && rootRef.current?.contains(anchor)) {
      const url = window.prompt("Adresse du lien (laissez vide pour retirer le lien) :", anchor.getAttribute("href") ?? "");
      if (url === null) return;
      if (!url.trim()) exec("unlink");
      else {
        anchor.setAttribute("href", url.trim());
        const host = anchor.closest<HTMLElement>("[data-id]");
        if (host?.dataset.id) update(host.dataset.id, { html: host.innerHTML });
      }
      return;
    }
    if (!sel || sel.isCollapsed) { setErr("Sélectionnez d'abord le texte à transformer en lien."); return; }
    setErr("");
    const url = window.prompt("Adresse du lien (https://… ou /page-du-site) :");
    if (!url?.trim()) return;
    exec("createLink", url.trim());
  };

  const uploadImage = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr(""); setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("file", f));
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const items: { url: string; name: string }[] = d.items ?? (d.item ? [d.item] : []);
      insertAfter(focusId, items.map((it) => ({ ...newBlock("hr"), type: "img" as BlockType, imageUrl: it.url, imageAlt: it.name })));
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
        insertAfter(focusId, [b]);
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
    insertAfter(focusId, [{ ...newBlock("hr"), type: "video", videoId: id }]);
  };

  const insertTags = () => {
    const input = window.prompt("Étiquette(s), séparées par une virgule (ex. Consulting, Club client) :");
    if (!input) return;
    const tags = input.split(",").map((t) => t.trim()).filter(Boolean);
    if (!tags.length) return;
    insertAfter(focusId, [{ ...newBlock("hr"), type: "tags", tags }]);
  };

  const addParagraphAfter = (id: string | null) => {
    const nb = newBlock("p");
    insertAfter(id, [nb]);
    focusBlock(nb.id, 0);
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
      snapshot();
      setBlocks(parseMarkdown(d.content ?? markdown));
      setEpoch((e) => e + 1);
      setInstruction("");
      setAlfMsg("Contenu mis à jour par Alfred. Relisez avant d'enregistrer — « Annuler » revient à votre version.");
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

  const focused = blocks.find((b) => b.id === focusId);
  const activeType = focused && isText(focused.type) ? focused.type : null;
  const words = markdown.replace(/[#>*_\[\]()!-]/g, " ").split(/\s+/).filter(Boolean).length;
  // Garde la sélection de texte quand on clique un bouton de la barre.
  const keepSel = (e: React.MouseEvent) => e.preventDefault();

  const TYPE_BTNS: { t: BlockType; label: string }[] = [
    { t: "p", label: "Texte" },
    { t: "h2", label: "Titre" },
    { t: "h3", label: "Sous-titre" },
    { t: "li", label: "• Liste" },
    { t: "oli", label: "1. Liste" },
    { t: "quote", label: "❝ Citation" },
  ];

  const controls = (b: Block, i: number) => (
    <span className="adm-wys-ctl">
      <button type="button" title="Monter" onMouseDown={keepSel} onClick={() => moveBlock(b.id, -1)} disabled={i === 0}>↑</button>
      <button type="button" title="Descendre" onMouseDown={keepSel} onClick={() => moveBlock(b.id, 1)} disabled={i === blocks.length - 1}>↓</button>
      <button type="button" title="Ajouter un paragraphe en dessous" onMouseDown={keepSel} onClick={() => addParagraphAfter(b.id)}>+</button>
      <button type="button" className="rm" title="Supprimer ce bloc" onMouseDown={keepSel} onClick={() => removeBlock(b.id)}>×</button>
    </span>
  );

  return (
    <div className="adm-md" ref={rootRef}>
      <div className="adm-md-toolbar">
        <button type="button" className="adm-md-tool" title="Revenir à l'état précédent (déplacement, suppression, collage, réécriture d'Alfred…)" onMouseDown={keepSel} onClick={undo} disabled={!canUndo}>↶ Annuler</button>
        <span className="adm-md-sep" />
        {TYPE_BTNS.map(({ t, label }) => (
          <button
            key={t}
            type="button"
            className={`adm-md-tool${activeType === t ? " act" : ""}`}
            title={BLOCK_LABEL[t]}
            onMouseDown={keepSel}
            onClick={() => focusId && setType(focusId, t)}
            disabled={!activeType}
          >
            {label}
          </button>
        ))}
        <span className="adm-md-sep" />
        <button type="button" className="adm-md-tool" title="Gras (Ctrl+B)" onMouseDown={keepSel} onClick={() => exec("bold")}><b>G</b></button>
        <button type="button" className="adm-md-tool" title="Italique (Ctrl+I)" onMouseDown={keepSel} onClick={() => exec("italic")}><i>I</i></button>
        <button type="button" className="adm-md-tool" title="Lien sur le texte sélectionné (ou modifier le lien sous le curseur)" onMouseDown={keepSel} onClick={insertLink}>🔗 Lien</button>
        <span className="adm-md-sep" />
        <button type="button" className="adm-md-tool img" title="Importer une image" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Import…" : "Image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden multiple onChange={(e) => uploadImage(e.target.files)} />
        <button type="button" className="adm-md-tool img" title="Choisir une image dans la médiathèque" onClick={() => setPick(true)}>🗂 Médiathèque</button>
        <button type="button" className="adm-md-tool img" title="Insérer une vidéo YouTube" onClick={insertVideo}>▶ Vidéo</button>
        <button type="button" className="adm-md-tool img" title="Joindre un document" onClick={() => attachRef.current?.click()} disabled={busy}>Pièce jointe</button>
        <input ref={attachRef} type="file" accept="application/pdf,image/*" hidden onChange={(e) => uploadAttachment(e.target.files)} />
        <button type="button" className="adm-md-tool img" title="Ligne de séparation" onClick={() => insertAfter(focusId, [newBlock("hr")])}>— Séparateur</button>
        <button type="button" className="adm-md-tool img" title="Étiquette(s) (ex. pour la newsletter)" onClick={insertTags}>🏷 Étiquette</button>
        <span className="adm-md-count">{words} mot{words > 1 ? "s" : ""}</span>
      </div>
      {err && <p style={{ color: "#c0392b", fontSize: ".8rem", margin: ".4rem .8rem 0" }}>{err}</p>}

      <div className="adm-wys">
        {blocks.map((b, i) => {
          const on = focusId === b.id;
          if (b.type === "hr") {
            return (
              <div key={`${epoch}-${b.id}`} data-id={b.id} className={`adm-wys-row${on ? " on" : ""}`} onClick={() => setFocusId(b.id)}>
                <div className="adm-wys-hr-row"><hr /></div>
                {controls(b, i)}
              </div>
            );
          }
          if (b.type === "img") {
            return (
              <div key={`${epoch}-${b.id}`} data-id={b.id} className={`adm-wys-row${on ? " on" : ""}`} onClick={() => setFocusId(b.id)}>
                <div className="adm-wys-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.imageUrl} alt={b.imageAlt ?? ""} />
                  <div className="adm-wys-media-opts">
                    <label>Affichage
                      <select value={b.imagePos ?? ""} onChange={(e) => { snapshot(); update(b.id, { imagePos: (e.target.value || undefined) as Block["imagePos"] }); }}>
                        <option value="">Pleine largeur</option>
                        <option value="gauche">Vignette à gauche du texte</option>
                        <option value="droite">Vignette à droite du texte</option>
                      </select>
                    </label>
                    <label>Description <small>(accessibilité, référencement)</small>
                      <input value={b.imageAlt ?? ""} onChange={(e) => update(b.id, { imageAlt: e.target.value.replace(/[\[\]|]/g, "") })} placeholder="Ce que montre l'image" />
                    </label>
                  </div>
                </div>
                {controls(b, i)}
              </div>
            );
          }
          if (b.type === "video") {
            return (
              <div key={`${epoch}-${b.id}`} data-id={b.id} className={`adm-wys-row${on ? " on" : ""}`} onClick={() => setFocusId(b.id)}>
                <div className="adm-wys-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${b.videoId}/mqdefault.jpg`} alt="" style={{ width: 120, borderRadius: 8 }} />
                  <span>▶ Vidéo YouTube</span>
                </div>
                {controls(b, i)}
              </div>
            );
          }
          if (b.type === "tags") {
            return (
              <div key={`${epoch}-${b.id}`} data-id={b.id} className={`adm-wys-row${on ? " on" : ""}`} onClick={() => setFocusId(b.id)}>
                <div className="adm-wys-chip">
                  {(b.tags ?? []).map((t) => <span key={t} className="adm-tag ck-tag-metier" data-metier={t}>{t}</span>)}
                </div>
                {controls(b, i)}
              </div>
            );
          }
          return (
            <div key={`${epoch}-${b.id}`} className={`adm-wys-row${on ? " on" : ""}`}>
              <BlockEditable
                b={b}
                focused={on}
                placeholder={
                  b.type === "h2" ? "Titre de partie" : b.type === "h3" ? "Sous-titre" :
                  blocks.length === 1 ? (placeholder ? "Écrivez ou collez votre texte ici…" : "Écrivez…") : "Écrivez…"
                }
                onFocus={() => { if (focusId !== b.id) snapshot(); setFocusId(b.id); }}
                onInput={(html) => update(b.id, { html })}
                onKey={onKey(b)}
                onPaste={onPaste(b)}
              />
              {controls(b, i)}
            </div>
          );
        })}
        <button type="button" className="adm-wys-add" onClick={() => addParagraphAfter(null)}>+ Ajouter un paragraphe à la fin</button>
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
      {alfMsg && <p style={{ fontSize: ".82rem", margin: ".5rem .8rem .6rem", color: alfMsg.startsWith("Contenu") ? "#2E9E6B" : "#c0392b" }}>{alfMsg}</p>}

      <MediaPicker
        open={pick}
        onClose={() => setPick(false)}
        onPick={(u, n) => { insertAfter(focusId, [{ ...newBlock("hr"), type: "img", imageUrl: u, imageAlt: n }]); setPick(false); }}
      />
    </div>
  );
}
