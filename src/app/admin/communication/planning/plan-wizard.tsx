"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { generatePlanAction, previewIgVisualAction } from "../reseaux/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn" type="submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="adm-spin" aria-hidden="true" />}
      {pending ? "Alfred prépare le planning…" : "Lancer Alfred"}
    </button>
  );
}

function PreviewBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="adm-btn ghost sm" type="submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="adm-spin" aria-hidden="true" />}
      {pending ? "Génération…" : "Voir un exemple de visuel"}
    </button>
  );
}

// Assistant de remplissage : fenêtre de paramétrage (cadence, thèmes, heures)
// avec aperçu du design Instagram et du format LinkedIn. Pensé pour le PC.
export function PlanWizard() {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<"semaine" | "mois">("semaine");
  const [li, setLi] = useState(3);
  const [ig, setIg] = useState(2);
  const [preview, runPreview] = useActionState(previewIgVisualAction, {});

  const weeks = period === "mois" ? 4 : 1;
  const total = weeks * (li + ig);

  return (
    <>
      <button className="adm-btn" type="button" onClick={() => setOpen(true)}>
        Remplir le planning avec Alfred
      </button>

      {open && (
        <div className="pl-wiz-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="pl-wiz" role="dialog" aria-label="Assistant de remplissage du planning">
            <div className="pl-wiz-head">
              <h2>Alfred remplit votre planning</h2>
              <button type="button" className="pl-wiz-close" onClick={() => setOpen(false)} aria-label="Fermer">×</button>
            </div>

            <form action={generatePlanAction} className="pl-wiz-body">
              <div className="pl-wiz-cols">
                <div>
                  <div className="adm-field">
                    <label>Période</label>
                    <select name="period" value={period} onChange={(e) => setPeriod(e.target.value as "semaine" | "mois")}>
                      <option value="semaine">La semaine à venir</option>
                      <option value="mois">Le mois à venir (4 semaines)</option>
                    </select>
                  </div>
                  <div className="adm-row2">
                    <div className="adm-field">
                      <label>LinkedIn / semaine</label>
                      <select name="liPerWeek" value={li} onChange={(e) => setLi(Number(e.target.value))}>
                        {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="adm-field">
                      <label>Instagram / semaine</label>
                      <select name="igPerWeek" value={ig} onChange={(e) => setIg(Number(e.target.value))}>
                        {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="adm-row2">
                    <div className="adm-field">
                      <label>Heure LinkedIn</label>
                      <input type="time" name="liTime" defaultValue="09:00" />
                    </div>
                    <div className="adm-field">
                      <label>Heure Instagram</label>
                      <input type="time" name="igTime" defaultValue="12:30" />
                    </div>
                  </div>
                  <div className="adm-field">
                    <label>Thèmes souhaités <small>(optionnel — Alfred choisit sinon)</small></label>
                    <textarea
                      name="themes"
                      placeholder="Ex. : facturation électronique, recrutement, IA pour les DAF, coulisses du cabinet…"
                      style={{ minHeight: 80 }}
                    />
                  </div>
                  <p className="muted" style={{ fontSize: ".84rem" }}>
                    Alfred va préparer <b>{total} post{total > 1 ? "s" : ""} planifié{total > 1 ? "s" : ""}</b> —
                    posés sur le calendrier, à relire ou déplacer avant leur départ automatique.
                  </p>
                  <SubmitBtn />
                </div>

                <div className="pl-wiz-design">
                  <h3>Design Instagram</h3>
                  <p className="muted" style={{ fontSize: ".8rem", margin: "0 0 .5rem" }}>
                    Visuel 1080×1080 généré depuis vos maquettes du Studio (Réglages) — titre en grand, pastille trevys.fr.
                  </p>
                  {preview.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview.url} alt="Aperçu du visuel Instagram" className="pl-wiz-visual" />
                  ) : (
                    <div className="pl-wiz-visual ph">Aperçu ici</div>
                  )}
                  {preview.error && <p style={{ color: "#c0392b", fontSize: ".8rem" }}>{preview.error}</p>}

                  <h3 style={{ marginTop: "1rem" }}>Format LinkedIn</h3>
                  <div className="pl-wiz-li">
                    <b>C&apos;est lundi, je vous partage un nouvel article sur…</b><br />
                    3-4 lignes qui donnent envie, ton humain, une pointe d&apos;humour.<br />
                    <span style={{ color: "#0A66C2", fontWeight: 700 }}>www.trevys.fr/blog/…</span><br />
                    <span className="muted">#Trevys #ExpertiseComptable #Conseil — et une question finale.</span>
                  </div>
                </div>
              </div>
            </form>

            {/* Aperçu design : formulaire séparé (ne lance pas le planning) */}
            <form action={runPreview} className="pl-wiz-previewrow">
              <input name="title" placeholder="Titre d'essai du visuel (ex. « L'IA au service des DAF »)" />
              <input name="subtitle" placeholder="Sous-titre (optionnel)" />
              <PreviewBtn />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
