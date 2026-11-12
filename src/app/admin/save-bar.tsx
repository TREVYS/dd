"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

// Barre d'enregistrement collée en bas de l'écran pendant l'édition d'un
// article : toujours sous la main (plus besoin de descendre tout en bas),
// signale les modifications non enregistrées, prévient avant de quitter la
// page sans enregistrer, et accepte Ctrl+S.
function Buttons({ isEdit, dirty }: { isEdit: boolean; dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <>
      <span className={`adm-savebar-st${dirty ? " dirty" : ""}`}>
        {pending ? "Enregistrement…" : dirty ? "● Non enregistré" : isEdit ? "Tout est enregistré" : "Nouvel article"}
      </span>
      {isEdit && (
        <button className="adm-btn ghost" type="submit" name="stay" value="1" disabled={pending} title="Enregistre et reste sur cette page (Ctrl+S)">
          Enregistrer
        </button>
      )}
      <button className="adm-btn" type="submit" disabled={pending}>
        {isEdit ? "Enregistrer et fermer" : "Publier l'article"}
      </button>
    </>
  );
}

export function SaveBar({ isEdit, viewHref, cancelHref }: { isEdit: boolean; viewHref?: string; cancelHref: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const mark = () => { dirtyRef.current = true; setDirty(true); };
    const onSubmit = () => { dirtyRef.current = false; };
    const onLeave = (e: BeforeUnloadEvent) => { if (dirtyRef.current) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const stay = form.querySelector<HTMLButtonElement>('button[name="stay"]');
        form.requestSubmit(stay ?? undefined);
      }
    };
    form.addEventListener("input", mark);
    form.addEventListener("change", mark);
    form.addEventListener("submit", onSubmit);
    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("keydown", onKey);
    return () => {
      form.removeEventListener("input", mark);
      form.removeEventListener("change", mark);
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="adm-savebar" ref={ref}>
      <Link className="adm-btn ghost sm adm-savebar-nav" href={cancelHref}>← Liste</Link>
      {viewHref && <a className="adm-btn ghost sm adm-savebar-nav" href={viewHref} target="_blank" rel="noopener noreferrer">Voir en ligne ↗</a>}
      <span style={{ flex: 1 }} />
      <Buttons isEdit={isEdit} dirty={dirty} />
    </div>
  );
}
