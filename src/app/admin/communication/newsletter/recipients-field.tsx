"use client";

import { useState } from "react";

// Champ « Destinataires » avec insertion en un clic de tous les inscrits :
// les adresses deviennent visibles et modifiables avant l'envoi.
export function RecipientsField({ subscribers }: { subscribers: string[] }) {
  const [value, setValue] = useState("");

  const addAll = () => {
    const existing = new Set(
      (value.match(/[^\s,;]+@[^\s,;]+/g) ?? []).map((e) => e.toLowerCase()),
    );
    const missing = subscribers.filter((e) => !existing.has(e.toLowerCase()));
    if (!missing.length) return;
    setValue((v) => (v.trim() ? `${v.trim()}\n` : "") + missing.join("\n"));
  };

  const count = (value.match(/[^\s,;]+@[^\s,;]+/g) ?? []).length;

  return (
    <div className="adm-field">
      <label>
        Destinataires (clients, contacts…){" "}
        <small>— une adresse par ligne, ou séparées par des virgules</small>
      </label>
      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginBottom: ".5rem" }}>
        <button type="button" className="adm-btn ghost sm" onClick={addAll} disabled={!subscribers.length}>
          + Ajouter les {subscribers.length} inscrit(s) à la liste
        </button>
        {value && (
          <button type="button" className="adm-btn ghost sm" onClick={() => setValue("")}>
            Vider
          </button>
        )}
        <span className="muted" style={{ alignSelf: "center", fontSize: ".82rem" }}>
          {count} destinataire{count > 1 ? "s" : ""} dans le champ
        </span>
      </div>
      <textarea
        name="recipients"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ minHeight: 120 }}
        placeholder={"client1@exemple.fr\nclient2@exemple.fr"}
      />
    </div>
  );
}
