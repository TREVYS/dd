"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { designVisualAction, draftFromVisualAction } from "./actions";

function GenBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn" type="submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="adm-spin" aria-hidden="true" />}
      {pending ? "Génération…" : "Générer le visuel"}
    </button>
  );
}

// Composeur du Studio design : titre + sous-titre + choix de maquette →
// aperçu immédiat, puis envoi en brouillon Instagram avec sa légende.
export function DesignComposer({ templates }: { templates: string[] }) {
  const [state, run] = useActionState(designVisualAction, {});
  const [tpl, setTpl] = useState<string>("");

  return (
    <div className="dsg-cols">
      <form action={run} className="dsg-form">
        <div className="adm-field">
          <label>Titre du visuel <small>(affiché en grand — max ~9 mots)</small></label>
          <input name="title" placeholder="Ex. « L'IA au service des DAF »" required />
        </div>
        <div className="adm-field">
          <label>Sous-titre <small>(optionnel)</small></label>
          <input name="subtitle" placeholder="Ex. « Le point en 3 minutes par Trevys »" />
        </div>
        <div className="adm-field">
          <label>Maquette de fond</label>
          <input type="hidden" name="template" value={tpl} />
          <div className="dsg-tpls">
            <button
              type="button"
              className={`dsg-tpl auto${tpl === "" ? " on" : ""}`}
              onClick={() => setTpl("")}
              title="Rotation automatique entre vos maquettes (ou fond Trevys)"
            >
              Auto
            </button>
            {templates.map((t) => (
              <button
                key={t}
                type="button"
                className={`dsg-tpl${tpl === t ? " on" : ""}`}
                onClick={() => setTpl(t)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t} alt="" />
              </button>
            ))}
          </div>
        </div>
        <GenBtn />
        {state.error && <p style={{ color: "#c0392b", fontSize: ".82rem", marginTop: ".5rem" }}>{state.error}</p>}
      </form>

      <div className="dsg-preview">
        {state.url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.url} alt="Visuel généré" className="dsg-visual" />
            <form action={draftFromVisualAction} className="dsg-useform">
              <input type="hidden" name="image" value={state.url} />
              <textarea
                name="caption"
                placeholder="Légende du post Instagram (optionnel — Alfred pourra la rédiger)"
                style={{ minHeight: 70 }}
              />
              <button className="adm-btn" type="submit">Créer le brouillon Instagram</button>
            </form>
          </>
        ) : (
          <div className="dsg-visual ph">
            L&apos;aperçu du visuel (1080×1080)<br />apparaîtra ici
          </div>
        )}
      </div>
    </div>
  );
}
