"use client";

import Link from "next/link";
import { useState } from "react";

export type BoardJob = {
  id: string;
  slug: string;
  title: string;
  category: string;
  contract: string;
  location: string;
  summary: string;
};

type Mode = "salarie" | "independant";

const FREELANCE_URL = "https://app.trevys-advisory.fr/candidature";
const isIndependant = (contract: string) => /freelance|ind[ée]pendant|portage/i.test(contract);

export function JobsBoard({ jobs }: { jobs: BoardJob[] }) {
  const [mode, setMode] = useState<Mode>("salarie");
  const counts = {
    salarie: jobs.filter((j) => !isIndependant(j.contract)).length,
    independant: jobs.filter((j) => isIndependant(j.contract)).length,
  };
  const shown = jobs.filter((j) => (mode === "independant") === isIndependant(j.contract));
  const n = shown.length;

  return (
    <>
      <div className="shead">
        <span className="eyebrow">Nos offres</span>
        <h2>
          {n === 0
            ? mode === "independant" ? <>Missions <em>indépendantes</em></> : <>Nos <em>postes</em></>
            : <>{n} {mode === "independant" ? "mission" : "poste"}{n > 1 ? "s" : ""} ouvert{mode === "independant" ? "e" : ""}{n > 1 ? "s" : ""}</>}
        </h2>
      </div>

      <div className="mkt-jobsw" role="group" aria-label="Type d'offres">
        <button
          type="button"
          className={mode === "salarie" ? "on" : ""}
          aria-pressed={mode === "salarie"}
          onClick={() => setMode("salarie")}
        >
          Salariés <small>CDI · CDD · alternance</small>
          <b>{counts.salarie}</b>
        </button>
        <button
          type="button"
          className={mode === "independant" ? "on" : ""}
          aria-pressed={mode === "independant"}
          onClick={() => setMode("independant")}
        >
          Indépendants <small>freelance · mission</small>
          <b>{counts.independant}</b>
        </button>
        <span className={`mkt-jobsw-thumb${mode === "independant" ? " right" : ""}`} aria-hidden="true" />
      </div>

      <div className="mkt-jobx-list">
        {shown.map((j) => {
          const conseil = /conseil|consult/i.test(j.category);
          return (
            <Link className={`mkt-jobx${conseil ? " is-conseil" : ""}`} key={j.id} href={`/nous-rejoindre/${j.slug}`}>
              <span className="mkt-jobx-ic" aria-hidden="true">
                {conseil ? (
                  <svg viewBox="0 0 24 24"><path d="M3 3v18h18M7 15l4-4 3 3 6-6" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" /></svg>
                )}
              </span>
              <div className="mkt-jobx-body">
                <span className="mkt-jobx-cat">{j.category}</span>
                <h3>{j.title}</h3>
                <p>{j.summary}</p>
                <div className="mkt-jobx-meta">
                  <span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
                    {j.contract}
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                    {j.location}
                  </span>
                </div>
              </div>
              <span className="mkt-jobx-go">Voir l&apos;offre <b aria-hidden="true">→</b></span>
            </Link>
          );
        })}

        {mode === "salarie" ? (
          <a className="mkt-jobx-spont" href="mailto:contact@trevys.fr?subject=Candidature%20spontanée">
            <span>
              <b>{n === 0 ? "Aucun poste ouvert pour l'instant" : "Pas d'offre à votre mesure ?"}</b>
              Envoyez-nous une candidature spontanée — les bons profils n&apos;attendent pas la bonne annonce.
            </span>
            <span className="mkt-jobx-spont-go">Candidature spontanée →</span>
          </a>
        ) : (
          <a className="mkt-jobx-spont" href={FREELANCE_URL} target="_blank" rel="noopener noreferrer">
            <span>
              <b>{n === 0 ? "Pas de mission publiée en ce moment" : "Vous ne voyez pas votre expertise ?"}</b>
              Nous faisons souvent appel à des renforts : rejoignez notre réseau de freelances, Jeremy Roch vous recontacte.
            </span>
            <span className="mkt-jobx-spont-go">Rejoindre le réseau →</span>
          </a>
        )}
      </div>
    </>
  );
}
