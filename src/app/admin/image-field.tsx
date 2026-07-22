"use client";

import { useRef, useState } from "react";

// Champ d'image de couverture : saisie d'URL OU import direct d'un fichier
// hébergé sur l'instance (via /api/admin/media). Renvoie l'URL dans un champ
// caché portant le `name` attendu par le formulaire.
export function ImageField({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const r = await fetch("/api/admin/media", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Échec de l'import.");
      setUrl(d.items?.[0]?.url ?? "");
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/uploads/mon-image.jpg ou https://…"
          style={{ flex: 1, minWidth: 220 }}
        />
        <button type="button" className="adm-btn ghost sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Import…" : "Importer une image"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {err && <p style={{ color: "#c0392b", fontSize: ".8rem", margin: ".3rem 0 0" }}>{err}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" style={{ marginTop: ".7rem", maxHeight: 130, borderRadius: 10, border: "1px solid var(--line)" }} />
      )}
    </div>
  );
}
