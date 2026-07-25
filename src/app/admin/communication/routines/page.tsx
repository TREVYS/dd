import Link from "next/link";
import { PendingButton } from "../../pending-button";
import { listRoutines, describeSchedule, nextDue, WEEKDAYS } from "@/lib/alfred-routines";
import { addRoutineAction, deleteRoutineAction, runNowAction, toggleRoutineAction, updateRoutineAction } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  article: "Article de blog",
  linkedin: "Post LinkedIn",
  instagram: "Post Instagram",
  newsletter: "Newsletter",
};

function RoutineFields({ defaults }: { defaults?: { label?: string; type?: string; freq?: string; weekday?: number; monthday?: number; topic?: string } }) {
  return (
    <>
      <div className="adm-field">
        <label>Nom de la routine</label>
        <input name="label" required defaultValue={defaults?.label ?? ""} placeholder="Ex. Article hebdo facturation électronique" />
      </div>
      <div className="adm-row2">
        <div className="adm-field">
          <label>Ce qu&apos;Alfred produit</label>
          <select name="type" defaultValue={defaults?.type ?? "article"}>
            <option value="article">Article de blog (brouillon)</option>
            <option value="linkedin">Post LinkedIn (brouillon)</option>
            <option value="instagram">Post Instagram (brouillon)</option>
            <option value="newsletter">Newsletter (brouillon)</option>
          </select>
        </div>
        <div className="adm-field">
          <label>Fréquence</label>
          <select name="freq" defaultValue={defaults?.freq ?? "hebdomadaire"}>
            <option value="hebdomadaire">Chaque semaine</option>
            <option value="quotidienne">Chaque jour</option>
            <option value="mensuelle">Chaque mois</option>
          </select>
        </div>
      </div>
      <div className="adm-row2">
        <div className="adm-field">
          <label>Jour de la semaine <small>(si hebdomadaire)</small></label>
          <select name="weekday" defaultValue={String(defaults?.weekday ?? 1)}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
        <div className="adm-field">
          <label>Jour du mois <small>(si mensuelle, 1-28)</small></label>
          <input type="number" name="monthday" min={1} max={28} defaultValue={defaults?.monthday ?? 1} />
        </div>
      </div>
      <div className="adm-field">
        <label>Consigne pour Alfred <small>— sujet, angle, ton…</small></label>
        <textarea name="topic" required style={{ minHeight: 80 }} defaultValue={defaults?.topic ?? ""}
          placeholder="Ex. Un article pédagogique sur la réforme de la facturation électronique : choisir un angle d'actualité, varier les sujets déjà traités sur le blog." />
      </div>
    </>
  );
}

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; ran?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const routines = listRoutines();
  const editing = sp.edit ? routines.find((r) => r.id === sp.edit) : undefined;

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Routines d&apos;Alfred</h1>
          <p>Les automatismes récurrents d&apos;Alfred. Tout part en brouillon — vous validez, puis vous publiez.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication">← Parler à Alfred</Link>
      </div>

      {sp.ok && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Routine enregistrée.</div>}
      {sp.ran && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Routine exécutée — le brouillon vous attend (calendrier éditorial ou réseaux sociaux).</div>}

      <div className="adm-note" style={{ marginBottom: "1.2rem" }}>
        ⏰ <b>Comment ça tourne :</b> les routines dues s&apos;exécutent automatiquement à votre première visite du cockpit
        de la journée (et jamais plus d&apos;une fois par jour chacune). Vous pouvez aussi lancer une routine à la main
        avec « Exécuter maintenant ». Astuce : demandez directement à Alfred dans le chat — « prépare-moi un article
        chaque lundi sur la RFE » — il créera la routine lui-même.
      </div>

      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>{editing ? `Modifier « ${editing.label} »` : "Nouvelle routine"}</h2>
        <form action={editing ? updateRoutineAction : addRoutineAction} className="adm-form" style={{ marginTop: ".6rem" }}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <RoutineFields defaults={editing} />
          <div className="adm-actions">
            <button className="adm-btn" type="submit">{editing ? "Enregistrer les modifications" : "Créer la routine"}</button>
            {editing && <Link className="adm-btn ghost" href="/admin/communication/routines">Annuler</Link>}
          </div>
        </form>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "1.1rem" }}>Routine</th>
              <th>Planification</th>
              <th>Dernière exécution</th>
              <th style={{ textAlign: "right", paddingRight: "1.1rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routines.map((r) => (
              <tr key={r.id} style={!r.enabled ? { opacity: 0.55 } : undefined}>
                <td style={{ paddingLeft: "1.1rem" }}>
                  <div style={{ fontWeight: 700 }}>{r.label} {!r.enabled && <span className="adm-tag">en pause</span>}</div>
                  <div style={{ margin: ".25rem 0" }}>
                    <span
                      className="adm-tag"
                      style={{
                        fontWeight: 800,
                        color: "#fff",
                        background:
                          r.type === "linkedin" ? "#0A66C2"
                          : r.type === "instagram" ? "#B0348C"
                          : r.type === "newsletter" ? "#2E9E6B"
                          : "var(--o2)",
                      }}
                    >
                      {TYPE_LABEL[r.type]}
                    </span>
                  </div>
                  <div className="muted">{r.topic.length > 90 ? r.topic.slice(0, 90) + "…" : r.topic}</div>
                </td>
                <td>
                  <div>{describeSchedule(r)}</div>
                  {r.enabled && <div className="muted">Prochaine : {nextDue(r).toLocaleDateString("fr-FR")}</div>}
                </td>
                <td className="muted">
                  {r.lastRun ? (
                    <>
                      {new Date(r.lastRun).toLocaleDateString("fr-FR")}
                      {r.lastResult && <div style={{ fontSize: ".78rem" }}>{r.lastResult}</div>}
                    </>
                  ) : "Jamais"}
                </td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end", paddingRight: "1.1rem", flexWrap: "wrap" }}>
                    <form action={runNowAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <PendingButton className="adm-btn sm" pendingLabel="Alfred travaille…">Exécuter maintenant</PendingButton>
                    </form>
                    <Link className="adm-btn ghost sm" href={`/admin/communication/routines?edit=${r.id}`}>Modifier</Link>
                    <form action={toggleRoutineAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="adm-btn ghost sm" type="submit">{r.enabled ? "Mettre en pause" : "Réactiver"}</button>
                    </form>
                    <form action={deleteRoutineAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="adm-btn danger sm" type="submit">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {routines.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ padding: "1.2rem" }}>
                Aucune routine. Créez-en une ci-dessus, ou demandez à Alfred : « prépare un article chaque lundi sur la facturation électronique ».
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
