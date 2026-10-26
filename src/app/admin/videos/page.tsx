import { listVideos, getVideosPlacement } from "@/lib/videos";
import { youtubeSyncConfigured } from "@/lib/youtube-sync";
import { addVideoAction, removeVideoAction, setPlacementAction, syncYoutubeNowAction, updateVideoDescriptionAction } from "./actions";
import { VideoOrder } from "./video-order";

export const dynamic = "force-dynamic";

export default async function AdminVideos({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; n?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const videos = listVideos();
  const placement = getVideosPlacement();
  const syncOn = youtubeSyncConfigured();

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Vidéos</h1>
          <p>Les vidéos YouTube mises en avant dans les Ressources du site.</p>
        </div>
      </div>

      {sp.ok === "1" && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Vidéo ajoutée.</div>}
      {sp.ok === "placement" && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Emplacement mis à jour.</div>}
      {sp.ok === "sync" && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          {sp.n === "0" ? "Synchronisation effectuée — aucune nouvelle vidéo." : `Synchronisation effectuée — ${sp.n} nouvelle(s) vidéo(s) ajoutée(s).`}
        </div>
      )}
      {sp.ok === "desc" && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Description enregistrée.</div>}
      {sp.err && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          {sp.err === "notfound"
            ? "Cette vidéo n&apos;existe pas sur YouTube (identifiant introuvable) — vérifiez le lien : c&apos;est lui qui sert de miniature dans la newsletter."
            : sp.err === "sync"
            ? `Synchronisation impossible${sp.msg ? " : " + sp.msg : ""}.`
            : "Lien YouTube non reconnu. Collez une URL comme https://youtu.be/… ou l&apos;identifiant."}
        </div>
      )}

      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Emplacement &amp; synchronisation</h2>
        <form action={setPlacementAction} className="adm-row2" style={{ alignItems: "end", marginTop: ".6rem" }}>
          <div className="adm-field">
            <label>Emplacement du bloc vidéo sur la page Ressources</label>
            <select name="placement" defaultValue={placement}>
              <option value="top">En haut, avant les articles (par défaut)</option>
              <option value="bottom">En bas, après les articles</option>
              <option value="hidden">Masqué (ne pas afficher)</option>
            </select>
          </div>
          <div className="adm-actions" style={{ margin: 0 }}>
            <button className="adm-btn" type="submit">Enregistrer l&apos;emplacement</button>
          </div>
        </form>
        <hr style={{ margin: "1.1rem 0", border: 0, borderTop: "1px solid var(--line)" }} />
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 .8rem" }}>
          {syncOn
            ? "Chaîne YouTube connectée — Alfred ajoute automatiquement les nouvelles vidéos chaque semaine (lien et description, sans téléchargement)."
            : <>Connectez votre chaîne YouTube dans <a href="/admin/reglages">Réglages</a> pour qu&apos;Alfred ajoute automatiquement vos nouvelles vidéos chaque semaine.</>}
        </p>
        <form action={syncYoutubeNowAction}>
          <button className="adm-btn ghost sm" type="submit" disabled={!syncOn}>Synchroniser maintenant</button>
        </form>
      </div>

      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Ajouter une vidéo</h2>
        <form action={addVideoAction} className="adm-form" style={{ marginTop: ".6rem" }}>
          <div className="adm-field">
            <label>Lien YouTube <small>(ou identifiant de la vidéo)</small></label>
            <input name="url" required placeholder="https://youtu.be/1-l-g7ElQq8" />
          </div>
          <div className="adm-row2">
            <div className="adm-field">
              <label>Titre</label>
              <input name="title" required placeholder="Ex. Facturation électronique : l'essentiel" />
            </div>
            <div className="adm-field">
              <label>Thème</label>
              <input name="focus" placeholder="Facturation électronique, IA, Innovation…" />
            </div>
          </div>
          <div className="adm-row2">
            <div className="adm-field">
              <label>Date <small>(optionnel)</small></label>
              <input type="date" name="date" />
            </div>
            <div className="adm-field">
              <label>Contexte <small>(optionnel)</small></label>
              <input name="note" placeholder="Ex. Relai LinkedIn Sage France" />
            </div>
          </div>
          <div className="adm-field">
            <label>Description <small>(optionnel — récupérée automatiquement depuis YouTube si la clé API est configurée et ce champ laissé vide)</small></label>
            <textarea name="description" placeholder="Laissez vide pour reprendre la description YouTube de la vidéo…" style={{ minHeight: 70 }} />
          </div>
          <div className="adm-actions">
            <button className="adm-btn" type="submit">Ajouter la vidéo</button>
          </div>
        </form>
      </div>

      <VideoOrder videos={videos.map((v) => ({ id: v.id, title: v.title, focus: v.focus, youtubeId: v.youtubeId }))} />

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr><th style={{ width: 132, paddingLeft: "1.1rem" }}>Aperçu</th><th>Titre</th><th>Thème</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td style={{ paddingLeft: "1.1rem" }}>
                  <a href={`https://youtu.be/${v.youtubeId}`} target="_blank" rel="noopener">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" style={{ width: 116, borderRadius: 8, display: "block" }} />
                  </a>
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>
                    {v.title}{" "}
                    {v.source === "youtube" && <span className="adm-tag" style={{ fontSize: ".68rem" }}>auto YouTube</span>}
                  </div>
                  {(v.note || v.date) && <div className="muted">{v.note}{v.note && v.date ? " · " : ""}{v.date}</div>}
                  <details style={{ marginTop: ".4rem" }}>
                    <summary style={{ cursor: "pointer", fontSize: ".78rem", color: "var(--ink3)" }}>
                      {v.description ? "Voir / modifier la description" : "Ajouter une description"}
                    </summary>
                    <form action={updateVideoDescriptionAction} style={{ marginTop: ".5rem" }}>
                      <input type="hidden" name="id" value={v.id} />
                      <textarea
                        name="description"
                        defaultValue={v.description || ""}
                        placeholder="Description de la vidéo (affichée sur le site)…"
                        style={{ minHeight: 70, width: "100%", fontSize: ".82rem" }}
                      />
                      <div className="adm-actions" style={{ marginTop: ".4rem" }}>
                        <button className="adm-btn sm" type="submit">Enregistrer</button>
                      </div>
                    </form>
                  </details>
                </td>
                <td><span className="adm-tag">{v.focus || "—"}</span></td>
                <td style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                  <form action={removeVideoAction}>
                    <input type="hidden" name="id" value={v.id} />
                    <button className="adm-btn danger sm" type="submit">Retirer</button>
                  </form>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ padding: "1.2rem" }}>Aucune vidéo pour l&apos;instant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
