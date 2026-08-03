"use client";

import { useMemo, useState } from "react";

export type SubRow = {
  email: string;
  name?: string;
  client?: boolean;
  profil?: string;
  date: string;
  read: boolean;
  opens: number;
  lastOpen?: string;
  active: boolean;
};

const PAGE = 25;

// Tableau des inscrits : recherche, filtres (client / activité / profil),
// catégorisation en ligne, affichage progressif. Tous les inscrits sont
// éditables, pas seulement les premiers.
export function SubscribersTable({
  rows,
  profils,
  updateAction,
  deleteAction,
}: {
  rows: SubRow[];
  profils: string[];
  updateAction: (fd: FormData) => void;
  deleteAction: (fd: FormData) => void;
}) {
  const [q, setQ] = useState("");
  const [fClient, setFClient] = useState("tous");
  const [fActif, setFActif] = useState("tous");
  const [fProfil, setFProfil] = useState("");
  const [shown, setShown] = useState(PAGE);

  const allProfils = useMemo(() => {
    const used = rows.map((r) => r.profil).filter((p): p is string => !!p);
    return [...new Set([...profils, ...used])];
  }, [rows, profils]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const p = fProfil.toLowerCase();
    return rows
      .filter((r) => {
        if (fClient === "oui" && r.client !== true) return false;
        if (fClient === "non" && r.client === true) return false;
        if (fActif === "oui" && !r.active) return false;
        if (fActif === "non" && r.active) return false;
        if (p && (r.profil ?? "").toLowerCase() !== p) return false;
        if (term && !`${r.email} ${r.name ?? ""} ${r.profil ?? ""}`.toLowerCase().includes(term)) return false;
        return true;
      })
      // Actifs d'abord, puis du plus récent au plus ancien.
      .sort((a, b) => (a.active === b.active ? b.date.localeCompare(a.date) : a.active ? -1 : 1));
  }, [rows, q, fClient, fActif, fProfil]);

  const visible = filtered.slice(0, shown);

  return (
    <>
      <div className="tp" style={{ marginBottom: ".9rem" }}>
        <div className="tp-row">
          <select value={fClient} onChange={(e) => { setFClient(e.target.value); setShown(PAGE); }} aria-label="Filtre client">
            <option value="tous">Clients et non-clients</option>
            <option value="oui">Clients du cabinet</option>
            <option value="non">Non-clients</option>
          </select>
          <select value={fActif} onChange={(e) => { setFActif(e.target.value); setShown(PAGE); }} aria-label="Filtre activité">
            <option value="tous">Actifs et inactifs</option>
            <option value="oui">Actifs (90 j)</option>
            <option value="non">Inactifs</option>
          </select>
          <select value={fProfil} onChange={(e) => { setFProfil(e.target.value); setShown(PAGE); }} aria-label="Filtre profil">
            <option value="">Tous les profils</option>
            {allProfils.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
            placeholder="Rechercher (nom, e-mail, profil)…"
            aria-label="Rechercher un inscrit"
          />
        </div>
        <div className="tp-count">
          <b>{filtered.length}</b> inscrit{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} sur {rows.length}
        </div>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Client / profil</th>
            <th>Inscrit le</th>
            <th>Activité</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((s) => (
            <tr key={s.email} style={!s.read ? { fontWeight: 700 } : undefined}>
              <td>
                {!s.read && <span style={{ color: "#E26A0F", marginRight: ".4rem" }} title="Nouvelle inscription">●</span>}
                {s.email}
                {s.name && <div className="muted" style={{ fontSize: ".78rem", fontWeight: 400 }}>{s.name}</div>}
              </td>
              <td>
                <form action={updateAction} className="ck-catform">
                  <input type="hidden" name="email" value={s.email} />
                  <input name="name" defaultValue={s.name ?? ""} placeholder="Nom" style={{ width: 90 }} />
                  <label title="Client du cabinet">
                    <input type="checkbox" name="client" defaultChecked={s.client === true} /> client
                  </label>
                  <input name="profil" defaultValue={s.profil ?? ""} placeholder="Profil" list="nl-profils" style={{ width: 90 }} />
                  <button className="adm-btn ghost sm" type="submit">OK</button>
                </form>
              </td>
              <td className="muted" style={{ whiteSpace: "nowrap" }}>
                {new Date(s.date).toLocaleDateString("fr-FR")}
              </td>
              <td>
                {s.opens === 0 ? (
                  <span className="muted">jamais ouvert</span>
                ) : (
                  <span style={{ fontSize: ".82rem", fontWeight: 600, color: s.active ? "#2E9E6B" : "var(--ink3)" }}>
                    {s.active ? "● Actif" : "○ Inactif"} · {s.opens} ouv.
                    {s.lastOpen ? ` · ${new Date(s.lastOpen).toLocaleDateString("fr-FR")}` : ""}
                  </span>
                )}
              </td>
              <td style={{ textAlign: "right" }}>
                <form action={deleteAction}>
                  <input type="hidden" name="email" value={s.email} />
                  <button className="adm-btn danger sm" type="submit">Supprimer</button>
                </form>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={5} className="muted" style={{ padding: "1rem" }}>
              {rows.length === 0 ? "Aucune inscription pour l'instant." : "Aucun inscrit ne correspond à ces critères."}
            </td></tr>
          )}
        </tbody>
      </table>

      {filtered.length > visible.length && (
        <div style={{ marginTop: ".8rem" }}>
          <button className="adm-btn ghost sm" type="button" onClick={() => setShown((n) => n + PAGE)}>
            Afficher {Math.min(PAGE, filtered.length - visible.length)} de plus
          </button>
        </div>
      )}
    </>
  );
}
