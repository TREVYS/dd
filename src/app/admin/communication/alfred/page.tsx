import Link from "next/link";
import { readAlfred } from "@/lib/alfred-config";
import { saveAlfredAction, addExampleAction, removeExampleAction } from "./actions";

export const dynamic = "force-dynamic";

export default function AlfredConfigPage() {
  const c = readAlfred();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Éduquer Alfred</h1>
          <p>Transmettez à Alfred votre voix, votre ligne éditoriale et des exemples de vos publications.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication">← Parler à Alfred</Link>
      </div>

      <div className="adm-note" style={{ marginBottom: "1.3rem" }}>
        🎩 Plus vous nourrissez Alfred (ton, messages clés, exemples de posts réussis), plus il écrit
        <b> comme vous</b>. Tout ce que vous réglez ici guide chacune de ses rédactions.
      </div>

      <form action={saveAlfredAction} className="adm-form">
        <div className="adm-field">
          <label>Ton & style <small>— comment Alfred doit s&apos;exprimer</small></label>
          <textarea name="ton" style={{ minHeight: 80 }} defaultValue={c.ton} />
        </div>
        <div className="adm-field">
          <label>Ligne éditoriale <small>— votre positionnement, ce dont vous parlez</small></label>
          <textarea name="ligneEditoriale" style={{ minHeight: 110 }} defaultValue={c.ligneEditoriale} />
        </div>
        <div className="adm-field">
          <label>Messages clés <small>— les idées à faire passer régulièrement</small></label>
          <textarea name="messagesCles" style={{ minHeight: 100 }} defaultValue={c.messagesCles} />
        </div>
        <div className="adm-row2">
          <div className="adm-field">
            <label>Mots / tournures à éviter</label>
            <textarea name="motsInterdits" style={{ minHeight: 70 }} defaultValue={c.motsInterdits} />
          </div>
          <div className="adm-field">
            <label>Signature</label>
            <input name="signature" defaultValue={c.signature} />
          </div>
        </div>
        <div className="adm-actions">
          <button className="adm-btn" type="submit">Enregistrer l&apos;éducation d&apos;Alfred</button>
        </div>
      </form>

      <div className="adm-card" style={{ marginTop: "1.6rem" }}>
        <h2>Exemples de publications passées ({c.exemples.length})</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 1rem" }}>
          Collez ici vos meilleurs posts LinkedIn / articles déjà écrits. Alfred s&apos;en inspirera
          pour retrouver votre style — sans les recopier.
        </p>

        <form action={addExampleAction} className="adm-form" style={{ marginBottom: "1.4rem" }}>
          <div className="adm-field">
            <label>Intitulé <small>(optionnel — ex. « Post RFE juin »)</small></label>
            <input name="label" placeholder="Nom de l'exemple" />
          </div>
          <div className="adm-field">
            <label>Contenu de la publication</label>
            <textarea name="content" style={{ minHeight: 120 }} placeholder="Collez le texte du post / de l'article…" required />
          </div>
          <div className="adm-actions">
            <button className="adm-btn ghost" type="submit">+ Ajouter cet exemple</button>
          </div>
        </form>

        {c.exemples.length === 0 ? (
          <p className="muted">Aucun exemple pour l&apos;instant.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
            {c.exemples.map((e) => (
              <div key={e.id} style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: "1rem 1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <b>{e.label || "Exemple"}</b>
                  <form action={removeExampleAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="adm-btn danger sm" type="submit">Supprimer</button>
                  </form>
                </div>
                <p style={{ margin: ".5rem 0 0", color: "var(--ink2)", fontSize: ".86rem", whiteSpace: "pre-wrap" }}>
                  {e.content.length > 400 ? e.content.slice(0, 400) + "…" : e.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
