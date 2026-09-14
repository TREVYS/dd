"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { simulerDividendesPfuBareme, PFU_IR, PFU_PS, PFU_TOTAL } from "@/lib/fiscal-2026";

const pct = (n: number) => `${Math.round(n * 1000) / 10} %`;

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function SimulateurDividendes() {
  const [dividende, setDividende] = useState(20_000);
  const [autresRevenus, setAutresRevenus] = useState(40_000);
  const [parts, setParts] = useState(1);

  const res = useMemo(
    () => simulerDividendesPfuBareme({ dividendeBrut: dividende, autresRevenusImposables: autresRevenus, parts }),
    [dividende, autresRevenus, parts],
  );

  const gagnant = res.optionRecommandee === "bareme" ? res.bareme : res.pfu;
  const gagnantLabel = res.optionRecommandee === "bareme" ? "le barème progressif" : "le PFU (flat tax)";

  return (
    <div className="sim">
      <div className="sim-grid">
        {/* Paramètres */}
        <div className="sim-form">
          <div className="sim-field">
            <label htmlFor="div">
              Montant brut des dividendes perçus
              <small>Le dividende versé par votre société, avant tout prélèvement.</small>
            </label>
            <div className="sim-money">
              <input
                id="div"
                type="number"
                min={0}
                step={1000}
                value={dividende}
                onChange={(e) => setDividende(Math.max(0, Number(e.target.value) || 0))}
              />
              <span>€</span>
            </div>
          </div>

          <div className="sim-field">
            <label htmlFor="autres">
              Autres revenus imposables du foyer
              <small>Salaires, rémunération de dirigeant, autres revenus — hors ce dividende. Détermine votre taux marginal si vous optez pour le barème.</small>
            </label>
            <div className="sim-money">
              <input
                id="autres"
                type="number"
                min={0}
                step={1000}
                value={autresRevenus}
                onChange={(e) => setAutresRevenus(Math.max(0, Number(e.target.value) || 0))}
              />
              <span>€</span>
            </div>
          </div>

          <div className="sim-field">
            <label htmlFor="parts">Parts fiscales du foyer</label>
            <select id="parts" value={parts} onChange={(e) => setParts(Number(e.target.value))}>
              <option value={1}>1 (célibataire)</option>
              <option value={1.5}>1,5</option>
              <option value={2}>2 (couple)</option>
              <option value={2.5}>2,5</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        <div className="sim-out">
          <div className="sim-hero">
            <span className="k">Option la plus favorable</span>
            <span className="v" style={{ fontSize: "1.5rem" }}>{gagnantLabel}</span>
            <span className="s">net perçu : {eur(gagnant.net)} sur {eur(dividende)} de dividendes</span>
          </div>

          <table className="sim-table">
            <tbody>
              <tr className="sep">
                <th>PFU (flat tax) — {pct(PFU_TOTAL)}<small>{pct(PFU_IR)} d&apos;impôt + {pct(PFU_PS)} de prélèvements sociaux, sur 100 % du brut</small></th>
                <td></td>
              </tr>
              <tr>
                <th>Impôt forfaitaire</th>
                <td className="neg">− {eur(res.pfu.impot)}</td>
              </tr>
              <tr>
                <th>Prélèvements sociaux</th>
                <td className="neg">− {eur(res.pfu.prelevementsSociaux)}</td>
              </tr>
              <tr className="sep">
                <th>Net PFU</th>
                <td>{eur(res.pfu.net)}</td>
              </tr>

              <tr className="sep">
                <th>Barème progressif<small>abattement de 40 % sur l&apos;impôt ; prélèvements sociaux sur 100 % du brut</small></th>
                <td></td>
              </tr>
              <tr>
                <th>Assiette imposable<small>après abattement de 40 %</small></th>
                <td>{eur(res.bareme.assietteImposable)}</td>
              </tr>
              <tr>
                <th>Impôt au taux marginal du foyer</th>
                <td className="neg">− {eur(res.bareme.irMarginal)}</td>
              </tr>
              <tr>
                <th>Prélèvements sociaux</th>
                <td className="neg">− {eur(res.bareme.prelevementsSociaux)}</td>
              </tr>
              <tr className="sep">
                <th>Net barème</th>
                <td>{eur(res.bareme.net)}</td>
              </tr>
            </tbody>
          </table>

          <div className="sim-compare">
            <b>Comparaison</b>
            <p>
              {res.optionRecommandee === "bareme" ? (
                <>Le <b>barème progressif</b> est plus favorable de <b>{eur(Math.abs(res.ecart))}</b> par rapport au PFU — c&apos;est le signe que votre taux marginal d&apos;imposition est inférieur à environ 21 % (30 % / 1,4, une fois l&apos;abattement pris en compte).</>
              ) : (
                <>Le <b>PFU</b> reste plus favorable de <b>{eur(Math.abs(res.ecart))}</b> par rapport au barème — c&apos;est le cas dès que votre taux marginal d&apos;imposition dépasse environ 21 %.</>
              )}
            </p>
            <p className="sim-note">
              L&apos;option pour le barème est <b>globale et irrévocable pour l&apos;année</b> : elle
              s&apos;applique à tous les revenus mobiliers du foyer (dividendes, intérêts…), pas
              seulement à ce dividende. Une partie de la CSG (6,8 points) devient déductible l&apos;année
              suivante en cas d&apos;option pour le barème — un avantage supplémentaire non chiffré ici.
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
