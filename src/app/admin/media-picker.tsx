"use client";

import { useEffect, useState } from "react";

type MediaItem = { name: string; url: string; size: number; mtime: number };

// Sélecteur d'image depuis la médiathèque de l'instance (/api/admin/media).
// Affiché en modale ; `onPick` reçoit l'URL choisie.
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string, name: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setErr("");
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setItems((d.items ?? []).filter((it: MediaItem) => !/\.pdf$/i.test(it.name))))
      .catch(() => setErr("Impossible de charger la médiathèque."))
      .finally(() => setLoading(false));
  }, [open]);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("file", f));
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      const listed = await fetch("/api/admin/media").then((x) => x.json());
      setItems((listed.items ?? []).filter((it: MediaItem) => !/\.pdf$/i.test(it.name)));
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  if (!open) return null;

  return (
    <div className="ck-picker-back" onClick={onClose}>
      <div className="ck-picker" onClick={(e) => e.stopPropagation()}>
        <div className="ck-picker-h">
          <b>Médiathèque</b>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <label className="adm-btn ghost sm" style={{ cursor: "pointer" }}>
              {busy ? "Import…" : "Importer"}
              <input type="file" accept="image/*" hidden multiple onChange={(e) => upload(e.target.files)} />
            </label>
            <button type="button" className="adm-btn ghost sm" onClick={onClose}>Fermer</button>
          </div>
        </div>
        {err && <p style={{ color: "#c0392b", fontSize: ".82rem", padding: "0 1rem" }}>{err}</p>}
        {loading ? (
          <p className="muted" style={{ padding: "1.2rem" }}>Chargement…</p>
        ) : items.length === 0 ? (
          <p className="muted" style={{ padding: "1.2rem" }}>Aucune image. Importez-en une ci-dessus.</p>
        ) : (
          <div className="ck-picker-grid">
            {items.map((it) => (
              <button
                type="button"
                key={it.name}
                className="ck-picker-item"
                title={it.name}
                onClick={() => {
                  onPick(it.url, it.name);
                  onClose();
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.url} alt={it.name} />
                <span>{it.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
