"use client";

import { useMemo, useState } from "react";

export type TargetContact = {
  email: string;
  name?: string;
  client?: boolean;
  profil?: string;
};

// Panneau unique de choix des destinataires : inscrits filtrés (deux axes +
// recherche), exclusions au clic contact par contact, adresses ajoutées à la
// main, et récapitulatif permanent du total. Tous les choix partent avec le
// formulaire (envoi immédiat ET programmation).
export function SendTargeting({ contacts, profils }: { contacts: TargetContact[]; profils: string[] }) {
  const [include, setInclude] = useState(contacts.length > 0);
  const [fClient, setFClient] = useState("tous");
  const [fProfil, setFProfil] = useState("");
  const [fq, setFq] = useState("");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [showList, setShowList] = useState(false);
  const [extraRaw, setExtraRaw] = useState("");

  const allProfils = useMemo(() => {
    const used = new Set(contacts.map((c) => c.profil).filter((p): p is string => !!p));
    return [...new Set([...profils, ...used])];
  }, [contacts, profils]);

  // Inscrits qui passent les filtres (exclusions non déduites).
  const filtered = useMemo(() => {
    if (!include) return [];
    const q = fq.trim().toLowerCase();
    const p = fProfil.toLowerCase();
    return contacts.filter((c) => {
      if (fClient === "oui" && c.client !== true) return false;
      if (fClient === "non" && c.client === true) return false;
      if (p && (c.profil ?? "").toLowerCase() !== p) return false;
      if (q && !`${c.email} ${c.name ?? ""} ${c.profil ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [contacts, include, fClient, fProfil, fq]);

  const kept = filtered.filter((c) => !excluded.has(c.email.toLowerCase()));
  const extras = useMemo(() => {
    const found = extraRaw.match(/[^\s,;]+@[^\s,;]+/g) ?? [];
    return [...new Set(found.map((e) => e.toLowerCase()))];
  }, [extraRaw]);
  const keptSet = new Set(kept.map((c) => c.email.toLowerCase()));
  const extrasNew = extras.filter((e) => !keptSet.has(e));
  const total = kept.length + extrasNew.length;
  const excludedCount = filtered.length - kept.length;

  const toggleExclude = (email: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      const k = email.toLowerCase();
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  return (
    <div className="tp">
      {/* Choix transmis au serveur (envoi ou programmation) */}
      <input type="hidden" name="includeSubscribers" value={include ? "on" : ""} />
      <input type="hidden" name="fClient" value={fClient} />
      <input type="hidden" name="fProfil" value={fProfil} />
      <input type="hidden" name="fq" value={fq} />
      <input type="hidden" name="exclude" value={[...excluded].join("\n")} />

      {/* 1. Les inscrits */}
      <label className="adm-diff-net" style={{ marginBottom: ".4rem" }}>
        <input
          type="checkbox"
          checked={include}
          disabled={contacts.length === 0}
          onChange={(e) => setInclude(e.target.checked)}
        />
        <b>Vos inscrits ({contacts.length})</b>
        <span className="muted" style={{ fontSize: ".82rem" }}>— affinez avec les filtres, écartez qui vous voulez d&apos;un clic</span>
      </label>

      {include && (
        <>
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
            <b>{kept.length}</b> inscrit{kept.length > 1 ? "s" : ""} retenu{kept.length > 1 ? "s" : ""}
            {excludedCount > 0 && <> ({excludedCount} écarté{excludedCount > 1 ? "s" : ""} à la main)</>}
            {" "}sur {contacts.length}
            {filtered.length > 0 && (
              <button type="button" className="tp-toggle" onClick={() => setShowList((v) => !v)}>
                {showList ? "masquer la liste" : "vérifier la liste"}
              </button>
            )}
            {excludedCount > 0 && (
              <button type="button" className="tp-toggle" onClick={() => setExcluded(new Set())}>
                tout réintégrer
              </button>
            )}
          </div>

          {showList && (
            <div className="tp-list">
              {filtered.map((c) => {
                const off = excluded.has(c.email.toLowerCase());
                return (
                  <button
                    type="button"
                    key={c.email}
                    className="tp-chip"
                    onClick={() => toggleExclude(c.email)}
                    title={off ? `${c.email} — écarté (cliquer pour réintégrer)` : `${c.email} — cliquer pour écarter`}
                    style={off ? { opacity: 0.42, textDecoration: "line-through", cursor: "pointer" } : { cursor: "pointer" }}
                  >
                    {c.name || c.email}
                    {c.client && <i className="cl">client</i>}
                    {c.profil && <i>{c.profil}</i>}
                    <i aria-hidden="true" style={{ fontWeight: 700 }}>{off ? "+" : "×"}</i>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 2. Adresses supplémentaires */}
      <div className="adm-field" style={{ marginTop: "1rem" }}>
        <label>
          Adresses supplémentaires <small>(optionnel — une par ligne ou séparées par des virgules)</small>
        </label>
        <textarea
          name="recipients"
          value={extraRaw}
          onChange={(e) => setExtraRaw(e.target.value)}
          style={{ minHeight: 70 }}
          placeholder={"client1@exemple.fr\nclient2@exemple.fr"}
        />
      </div>

      {/* 3. Récapitulatif permanent */}
      <div
        className="adm-note"
        style={{
          margin: ".2rem 0 .9rem",
          borderColor: total > 0 ? "#bfe3c9" : "#f0d5d1",
          background: total > 0 ? "#f1faf3" : "#fdf3f2",
          fontWeight: 600,
        }}
      >
        {total > 0 ? (
          <>
            Ce mailing partira à <b>{total} destinataire{total > 1 ? "s" : ""}</b>
            {" "}({kept.length} inscrit{kept.length > 1 ? "s" : ""}
            {extrasNew.length > 0 && <> + {extrasNew.length} adresse{extrasNew.length > 1 ? "s" : ""} ajoutée{extrasNew.length > 1 ? "s" : ""}</>}
            {excludedCount > 0 && <>, {excludedCount} écarté{excludedCount > 1 ? "s" : ""}</>}).
          </>
        ) : (
          <>Aucun destinataire pour l&apos;instant — cochez les inscrits ou ajoutez des adresses.</>
        )}
      </div>
    </div>
  );
}
