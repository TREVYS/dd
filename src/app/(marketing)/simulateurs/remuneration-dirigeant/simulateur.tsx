"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { simuler, meilleureRepartition, type Statut } from "@/lib/fiscal-2026";

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function SimulateurRemuneration() {
  const [disponible, setDisponible] = useState(120_000);
  const [statut, setStatut] = useState<Statut>("tns");
  const [part, setPart] = useState(60);
  const [parts, setParts] = useState(1);
  const [capital, setCapital] = useState(10_000);

  const entree = { disponible, statut, parts, capitalSocial: capital };
  const res = useMemo(() => simuler({ ...entree, partRemuneration: part / 100 }), [disponible, statut, part, parts, capital]);
  const best = useMemo(() => meilleureRepartition(entree), [disponible, statut, parts, capital]);
  const autre = useMemo(
    () => meilleureRepartition({ ...entree, statut: statut === "tns" ? "assimile" : "tns" }),
    [disponible, statut, parts, capital],
  );

  const ecart = best.resultat.netEnPoche - autre.resultat.netEnPoche;

  return (
    <div className="sim">
      <div className="sim-grid">
        {/* Paramètres */}
        <div className="sim-form">
          <div className="sim-field">
            <label htmlFor="dispo">
              Résultat disponible avant rémunération
              <small>Ce que l&apos;entreprise peut consacrer au dirigeant (rémunération + charges), avant impôt sur les sociétés.</small>
            </label>
            <div className="sim-money">
              <input
                id="dispo"
                type="number"
                min={0}
                step={5000}
                value={disponible}
                onChange={(e) => setDisponible(Math.max(0, Number(e.target.value) || 0))}
              />
              <span>€</span>
            </div>
          </div>

          <div className="sim-field">
            <label>Statut du dirigeant</label>
            <div className="sim-toggle">
              <button type="button" className={statut === "tns" ? "on" : ""} onClick={() => setStatut("tns")}>
                Gérant majoritaire (TNS)
                <small>SARL, EURL</small>
              </button>
              <button type="button" className={statut === "assimile" ? "on" : ""} onClick={() => setStatut("assimile")}>
                Assimilé salarié
                <small>SAS, SASU</small>
              </button>
            </div>
          </div>

          <div className="sim-field">
            <label htmlFor="part">
              Part en rémunération : <b>{part} %</b>
              <small>Le reste est distribué en dividendes, après impôt sur les sociétés.</small>
            </label>
            <input
              id="part"
              type="range"
              min={0}
              max={100}
              step={5}
              value={part}
              onChange={(e) => setPart(Number(e.target.value))}
              className="sim-range"
            />
            <div className="sim-range-lbl"><span>100 % dividendes</span><span>100 % rémunération</span></div>
          </div>

          <div className="sim-row2">
            <div className="sim-field">
              <label htmlFor="parts">Parts fiscales</label>
              <select id="parts" value={parts} onChange={(e) => setParts(Number(e.target.value))}>
                <option value={1}>1 (célibataire)</option>
                <option value={1.5}>1,5</option>
                <option value={2}>2 (couple)</option>
                <option value={2.5}>2,5</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            {statut === "tns" && (
              <div className="sim-field">
                <label htmlFor="cap">
                  Capital social
                  <small>Seuil des 10 %</small>
                </label>
                <div className="sim-money">
                  <input
                    id="cap"
                    type="number"
                    min={0}
                    step={1000}
                    value={capital}
                    onChange={(e) => setCapital(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <span>€</span>
                </div>
              </div>
            )}
          </div>

          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPart(Math.round(best.part * 100))}>
            Appliquer la répartition la plus favorable ({Math.round(best.part * 100)} %)
          </button>
        </div>

        {/* Résultats */}
        <div className="sim-out">
          <div className="sim-hero">
            <span className="k">Net en poche estimé</span>
            <span className="v">{eur(res.netEnPoche)}</span>
            <span className="s">
              soit {res.tauxPrelevementGlobal} % de prélèvements sur {eur(disponible)}
            </span>
          </div>

          <table className="sim-table">
            <tbody>
              <tr>
                <th>Rémunération nette</th>
                <td>{eur(res.remunerationNette)}</td>
              </tr>
              <tr>
                <th>Charges sociales{statut === "assimile" ? " (patronales + salariales)" : ""}</th>
                <td className="neg">− {eur(res.chargesSociales)}</td>
              </tr>
              <tr>
                <th>Impôt sur le revenu (rémunération)</th>
                <td className="neg">− {eur(res.irSurRemuneration)}</td>
              </tr>
              <tr className="sep">
                <th>Bénéfice avant impôt sur les sociétés</th>
                <td>{eur(res.beneficeAvantIs)}</td>
              </tr>
              <tr>
                <th>Impôt sur les sociétés</th>
                <td className="neg">− {eur(res.is)}</td>
              </tr>
              {res.cotisationsDividendes > 0 && (
                <tr>
                  <th>
                    Cotisations sur dividendes
                    <small>part au-delà de 10 % du capital</small>
                  </th>
                  <td className="neg">− {eur(res.cotisationsDividendes)}</td>
                </tr>
              )}
              <tr>
                <th>
                  Prélèvement forfaitaire unique
                  <small>12,8 % impôt + 18,6 % prélèvements sociaux</small>
                </th>
                <td className="neg">− {eur(res.prelevementsDividendes)}</td>
              </tr>
            </tbody>
          </table>

          <div className="sim-compare">
            <b>Comparaison des statuts</b>
            <p>
              Au mieux, votre situation actuelle ({statut === "tns" ? "gérant majoritaire" : "assimilé salarié"})
              laisse <b>{eur(best.resultat.netEnPoche)}</b> net, contre{" "}
              <b>{eur(autre.resultat.netEnPoche)}</b> en {statut === "tns" ? "assimilé salarié" : "gérant majoritaire"}
              {" "}— soit un écart de <b>{eur(Math.abs(ecart))}</b> {ecart >= 0 ? "en faveur de votre statut" : "en faveur de l'autre statut"}.
            </p>
            <p className="sim-note">
              L&apos;écart de net ne dit pas tout : le statut assimilé salarié ouvre une meilleure
              couverture retraite et prévoyance. Le bon arbitrage tient compte de vos besoins de
              protection, pas seulement du net immédiat.
            </p>
          </div>

          <div className="sim-cta">
            <Link className="btn btn-gold" href="/rendez-vous">Faire vérifier par un expert-comptable</Link>
            <Link className="btn btn-ghost" href="/newsletter">Recevoir nos analyses</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
