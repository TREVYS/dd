import { getStudio } from "@/lib/ig-studio";
import { listUploads } from "@/lib/media";
import { ImageField } from "../../image-field";
import { DesignComposer } from "./design-composer";
import { addTemplateAction, removeTemplateAction, saveStyleAction, deleteVisualAction } from "./actions";

export const dynamic = "force-dynamic";

// Studio design (PC) : composer des visuels Instagram sur vos maquettes,
// gérer les maquettes et les goûts, retrouver les visuels générés.
export default async function DesignStudioPage() {
  const studio = getStudio();
  const generated = listUploads().filter((m) => /^ig-.*\.png$/.test(m.name)).slice(0, 12);

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Studio design</h1>
          <p>Composez vos visuels Instagram sur vos maquettes — Alfred utilise les mêmes réglages pour les siens.</p>
        </div>
      </div>

      <div className="adm-card">
        <h2>Composer un visuel</h2>
        <DesignComposer templates={studio.templates} />
      </div>

      <div className="adm-cols2">
        <div className="adm-card" style={{ marginBottom: 0 }}>
          <h2>Vos maquettes de fond</h2>
          {studio.templates.length === 0 ? (
            <p className="muted" style={{ fontSize: ".86rem" }}>
              Aucune maquette : les visuels utilisent le fond aux couleurs du cabinet. Ajoutez des images (idéalement carrées).
            </p>
          ) : (
            <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", marginBottom: ".8rem" }}>
              {studio.templates.map((t) => (
                <div key={t} style={{ textAlign: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t} alt="" style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }} />
                  <form action={removeTemplateAction}>
                    <input type="hidden" name="url" value={t} />
                    <button className="adm-btn danger sm" type="submit" style={{ marginTop: ".25rem" }}>Retirer</button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form action={addTemplateAction}>
            <div className="adm-field">
              <label>Ajouter une maquette</label>
              <ImageField name="template" />
            </div>
            <button className="adm-btn ghost sm" type="submit" style={{ marginTop: ".4rem" }}>Ajouter</button>
          </form>

          <form action={saveStyleAction} style={{ marginTop: "1.2rem" }}>
            <div className="adm-field">
              <label>Ce que j&apos;aime <small>(Alfred en tient compte)</small></label>
              <textarea name="style" defaultValue={studio.style} placeholder="Sobre et premium, orange Trevys en accent…" style={{ minHeight: 70 }} />
            </div>
            <button className="adm-btn ghost sm" type="submit" style={{ marginTop: ".4rem" }}>Enregistrer</button>
          </form>
        </div>

        <div className="adm-card" style={{ marginBottom: 0 }}>
          <h2>Derniers visuels générés</h2>
          {generated.length === 0 ? (
            <p className="muted" style={{ fontSize: ".86rem" }}>Aucun visuel généré pour l&apos;instant.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: ".7rem" }}>
              {generated.map((m) => (
                <div key={m.name} style={{ textAlign: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }} />
                  <form action={deleteVisualAction}>
                    <input type="hidden" name="name" value={m.name} />
                    <button className="adm-btn danger sm" type="submit" style={{ marginTop: ".25rem" }}>Suppr.</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
