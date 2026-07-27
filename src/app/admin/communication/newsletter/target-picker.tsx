"use client";

import { useMemo, useState } from "react";

export type TargetContact = {
  email: string;
  name?: string;
  client?: boolean;
  profil?: string;
};

// Moteur de sélection des destinataires : deux axes (client du cabinet,
// profil) + recherche libre, avec compteur en direct. Les filtres partent
// avec le formulaire d'envoi (champs fClient / fProfil / fq).
export function TargetPicker({ contacts, profils }: { contacts: TargetContact[]; profils: string[] }) {
  const [fClient, setFClient] = useState("tous");
  const [fProfil, setFProfil] = useState("");
  const [fq, setFq] = useState("");
  const [showList, setShowList] = useState(false);

  const allProfils = useMemo(() => {
    const used = new Set(contacts.map((c) => c.profil).filter((p): p is string => !!p));
    return [...new Set([...profils, ...used])];
  }, [contacts, profils]);

  const selected = useMemo(() => {
    const q = fq.trim().toLowerCase();
    const p = fProfil.toLowerCase();
    return contacts.filter((c) => {
      if (fClient === "oui" && c.client !== true) return false;
      if (fClient === "non" && c.client === true) return false;
      if (p && (c.profil ?? "").toLowerCase() !== p) return false;
      if (q && !`${c.email} ${c.name ?? ""} ${c.profil ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [contacts, fClient, fProfil, fq]);

  return (
    <div className="tp">
      <input type="hidden" name="fClient" value={fClient} />
      <input type="hidden" name="fProfil" value={fProfil} />
      <input type="hidden" name="fq" value={fq} />

      <div className="tp-row">
        <select value={fClient} onChange={(e) => setFClient(e.target.value)} aria-label="Filtre client">
          <option value="tous">Clients et non-clients</option>
          <option value="oui">Clients du cabinet uniquement</option>
          <option value="non">Non-clients uniquement</option>
        </select>
        <select value={fProfil} onChange={(e) => setFProfil(e.target.value)} aria-label="Filtre profil">
          <option value="">Tous les profils</option>
          {allProfils.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          type="search"
          value={fq}
          onChange={(e) => setFq(e.target.value)}
          placeholder="Rechercher (nom, e-mail, profil)…"
          aria-label="Recherche de contacts"
        />
      </div>

      <div className="tp-count">
        <b>{selected.length}</b> contact{selected.length > 1 ? "s" : ""} sélectionné{selected.length > 1 ? "s" : ""}
        {" "}sur {contacts.length}
        {selected.length > 0 && (
          <button type="button" className="tp-toggle" onClick={() => setShowList((v) => !v)}>
            {showList ? "masquer la liste" : "voir la liste"}
          </button>
        )}
      </div>

      {showList && (
        <div className="tp-list">
          {selected.map((c) => (
            <span key={c.email} className="tp-chip" title={c.email}>
              {c.name || c.email}
              {c.client && <i className="cl">client</i>}
              {c.profil && <i>{c.profil}</i>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
