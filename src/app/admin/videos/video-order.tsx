"use client";

import { useRef, useState, useTransition } from "react";
import { reorderVideosAction } from "./actions";

type VideoRow = { id: string; title: string; focus: string; youtubeId: string };

// Réorganisation par glisser-déposer de l'ordre d'affichage des vidéos sur
// le site (même mécanique que l'ordre des articles dans la newsletter).
export function VideoOrder({ videos }: { videos: VideoRow[] }) {
  const [order, setOrder] = useState(videos);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function move(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= order.length) return;
    const next = [...order];
    [next[i], next[t]] = [next[t], next[i]];
    setOrder(next);
    setDirty(true);
  }

  function onDrop(i: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (from === null || from === i) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    setDirty(true);
  }

  function apply() {
    startTransition(async () => {
      await reorderVideosAction(order.map((v) => v.id));
      setDirty(false);
    });
  }

  if (order.length < 2) return null;

  return (
    <div className="ck-artorder" style={{ marginBottom: "1.2rem" }}>
      <div className="ck-artorder-h">
        Ordre d&apos;affichage des vidéos <span className="muted">— glissez pour réordonner, puis « Appliquer »</span>
      </div>
      <ol className="ck-artorder-list">
        {order.map((v, i) => (
          <li
            key={v.id}
            className={`ck-artorder-item${dragOver === i ? " over" : ""}`}
            draggable
            onDragStart={() => { dragFrom.current = i; }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
            onDragLeave={() => setDragOver((val) => (val === i ? null : val))}
            onDrop={(e) => { e.preventDefault(); onDrop(i); }}
            onDragEnd={() => { dragFrom.current = null; setDragOver(null); }}
          >
            <span className="ck-artorder-handle" aria-hidden="true">⠿</span>
            {v.focus && <span className="adm-tag" style={{ marginRight: ".5rem" }}>{v.focus}</span>}
            <span className="ck-artorder-t">{v.title}</span>
            <span className="ck-artorder-btns">
              <button type="button" className="ck-artorder-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
              <button type="button" className="ck-artorder-btn" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label="Descendre">↓</button>
            </span>
          </li>
        ))}
      </ol>
      <div className="adm-actions" style={{ marginTop: ".7rem" }}>
        <button type="button" className="adm-btn sm" onClick={apply} disabled={!dirty || pending}>
          {pending ? "Enregistrement…" : "Appliquer l'ordre"}
        </button>
      </div>
    </div>
  );
}
