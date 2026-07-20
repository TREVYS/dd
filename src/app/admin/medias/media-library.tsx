"use client";

import { useEffect, useRef, useState } from "react";

type Item = { name: string; url: string; size: number; mtime: number };

function fmt(b: number) {
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} Ko`;
  return `${(b / 1024 / 1024).toFixed(1)} Mo`;
}

export function MediaLibrary() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/media");
      const d = await r.json();
      setItems(d.items ?? []);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const upload = async (files: FileList | File[]) => {
    setError("");
    setBusy(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("file", f));
    try {
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  const remove = async (name: string) => {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    load();
  };

  const copy = (url: string) => {
    const full = `${location.origin}${url}`;
    navigator.clipboard?.writeText(full);
    setCopied(url);
    setTimeout(() => setCopied(""), 1600);
  };

  const isImg = (n: string) => /\.(jpe?g|png|webp|gif|svg)$/i.test(n);

  return (
    <>
      <div
        className={`adm-drop${drag ? " on" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          hidden
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <div className="adm-drop-ic">↑</div>
        <div>
          <b>{busy ? "Import en cours…" : "Importer des médias"}</b>
          <div className="muted">Glissez vos fichiers ici ou cliquez — images & PDF, 8 Mo max. Hébergés sur votre instance.</div>
        </div>
      </div>

      {error && <p style={{ color: "#c0392b", fontSize: ".85rem", marginTop: ".8rem" }}>{error}</p>}

      <div className="adm-card" style={{ marginTop: "1.4rem" }}>
        <h2>Bibliothèque {items.length > 0 && `(${items.length})`}</h2>
        {loading ? (
          <p className="muted">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="muted">Aucun média importé pour l&apos;instant.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1rem" }}>
            {items.map((it) => (
              <div key={it.name} className="adm-media">
                <div className="adm-media-th">
                  {isImg(it.name) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.url} alt={it.name} />
                  ) : (
                    <span className="adm-media-file">PDF</span>
                  )}
                </div>
                <div className="adm-media-nm" title={it.name}>{it.name}</div>
                <div className="muted" style={{ fontSize: ".72rem" }}>{fmt(it.size)}</div>
                <div className="adm-actions" style={{ justifyContent: "flex-start", marginTop: ".4rem" }}>
                  <button className="adm-btn ghost sm" type="button" onClick={() => copy(it.url)}>
                    {copied === it.url ? "Copié !" : "Copier l'URL"}
                  </button>
                  <button className="adm-btn danger sm" type="button" onClick={() => remove(it.name)}>Suppr.</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
