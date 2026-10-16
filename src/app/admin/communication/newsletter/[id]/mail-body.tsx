"use client";

import { useMemo, useRef, useState } from "react";
import { MarkdownEditor } from "../../../markdown-editor";
import { parseBody, buildBody, type ArticleBlock } from "./mail-blocks";

// Édition du corps du mailing : si le texte a été composé à partir
// d'articles (cas le plus fréquent), un bloc de réorganisation par
// glisser-déposer apparaît au-dessus de l'éditeur — plus besoin de
// couper-coller du Markdown à la main pour changer l'ordre.
export function MailBody({ initialBody }: { initialBody: string }) {
  const [body, setBody] = useState(initialBody);
  const [editorKey, setEditorKey] = useState(0);
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const parsed = useMemo(() => parseBody(body), [body]);
  const [order, setOrder] = useState<ArticleBlock[] | null>(parsed?.blocks ?? null);
  // Si le texte a été réécrit à la main depuis le dernier passage ici,
  // on resynchronise la liste visible avec le contenu réel.
  const orderList = order && parsed && order.length === parsed.blocks.length ? order : parsed?.blocks ?? null;

  function move(i: number, dir: -1 | 1) {
    if (!orderList) return;
    const next = [...orderList];
    const t = i + dir;
    if (t < 0 || t >= next.length) return;
    [next[i], next[t]] = [next[t], next[i]];
    setOrder(next);
  }

  function onDrop(i: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null || from === i || !orderList) return;
    const next = [...orderList];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setOrder(next);
  }

  function apply() {
    if (!parsed || !orderList) return;
    setBody(buildBody(parsed, orderList));
    setEditorKey((k) => k + 1);
  }

  return (
    <>
      {parsed && orderList && orderList.length > 1 && (
        <div className="ck-artorder" style={{ marginBottom: "1rem" }}>
          <div className="ck-artorder-h">
            Ordre des articles <span className="muted">— glissez pour réordonner, puis « Appliquer »</span>
          </div>
          <ol className="ck-artorder-list">
            {orderList.map((b, i) => (
              <li
                key={b.key}
                className={`ck-artorder-item${dragOver === i ? " over" : ""}`}
                draggable
                onDragStart={() => { dragFrom.current = i; }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver((v) => (v === i ? null : v))}
                onDrop={(e) => { e.preventDefault(); onDrop(i); }}
                onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
              >
                <span className="ck-artorder-handle" aria-hidden="true">⠿</span>
                {b.tag && <span className="adm-tag ck-tag-metier" data-metier={b.tag} style={{ marginRight: ".5rem" }}>{b.tag}</span>}
                <span className="ck-artorder-t">{b.title}</span>
                <span className="ck-artorder-btns">
                  <button type="button" className="ck-artorder-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
                  <button type="button" className="ck-artorder-btn" onClick={() => move(i, 1)} disabled={i === orderList.length - 1} aria-label="Descendre">↓</button>
                </span>
              </li>
            ))}
          </ol>
          <div className="adm-actions" style={{ marginTop: ".7rem" }}>
            <button type="button" className="adm-btn sm" onClick={apply}>Appliquer l&apos;ordre</button>
          </div>
        </div>
      )}

      <div className="adm-field">
        <label>Message <small>— barre d&apos;outils pour la mise en forme. Pas besoin de code.</small></label>
        <MarkdownEditor key={editorKey} name="body" defaultValue={body} placeholder={"Bonjour,\n\n## Un titre\n\nVotre message…"} />
      </div>
    </>
  );
}
