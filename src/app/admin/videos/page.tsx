import { listVideos } from "@/lib/videos";
import { addVideoAction, removeVideoAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminVideos({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const sp = await searchParams;
  const videos = listVideos();

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Vidéos</h1>
          <p>Les vidéos YouTube mises en avant dans les Ressources du site.</p>
        </div>
      </div>

      {sp.ok && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Vidéo ajoutée.</div>}
      {sp.err && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>Lien YouTube non reconnu. Collez une URL comme https://youtu.be/… ou l&apos;identifiant.</div>}

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
          <div className="adm-actions">
            <button className="adm-btn" type="submit">Ajouter la vidéo</button>
          </div>
        </form>
      </div>

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
                  <div style={{ fontWeight: 700 }}>{v.title}</div>
                  {v.note && <div className="muted">{v.note}{v.date ? ` · ${v.date}` : ""}</div>}
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
