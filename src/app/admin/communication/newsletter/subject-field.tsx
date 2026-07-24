"use client";

import { useState } from "react";

// Champ « Objet » du mailing, avec proposition d'Alfred (ton chaleureux,
// pas trop sérieux). Lit le contenu du message dans le même formulaire.
export function SubjectField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const suggest = async () => {
    setBusy(true);
    setErr("");
    try {
      const ta = document.querySelector<HTMLTextAreaElement>('textarea[name="body"]');
      const r = await fetch("/api/admin/comms/subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: ta?.value ?? "" }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Alfred n'a pas pu proposer d'objet.");
      if (d.subject) setValue(d.subject);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <div className="adm-field">
      <label>Objet</label>
      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
        <input
          name="subject"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <button type="button" className="adm-btn ghost sm" onClick={suggest} disabled={busy}>
          {busy ? "Alfred réfléchit…" : "✦ Objet par Alfred"}
        </button>
      </div>
      {err && <p style={{ color: "#c0392b", fontSize: ".8rem", margin: ".3rem 0 0" }}>{err}</p>}
    </div>
  );
}
