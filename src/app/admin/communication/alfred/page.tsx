import Link from "next/link";
import { readAlfred } from "@/lib/alfred-config";
import {
  saveAlfredAction,
  addExampleAction,
  removeExampleAction,
  addKnowledgeFileAction,
  addKnowledgeUrlAction,
  addKnowledgeTextAction,
  removeKnowledgeAction,
} from "./actions";

export const dynamic = "force-dynamic";

const KERR: Record<string, string> = {
  file: "Sélectionnez un fichier valide.",
  extract: "Impossible d'extraire le texte de ce document (essayez un PDF, un Word .docx, ou collez le texte).",
  url: "Entrez une URL valide (https://…).",
  fetch: "Impossible de charger cette page web.",
  empty: "Le contenu est vide.",
};

export default async function AlfredConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ kok?: string; kerr?: string }>;
}) {
  const sp = await searchParams;
  const c = readAlfred();
  const docs = c.knowledge ?? [];
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
        <h2>Base de connaissance ({docs.length})</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 1rem" }}>
          Nourrissez Alfred de documentation : PDF, Word (.docx), notes ou pages web (ex. textes officiels
          DGFiP, guides, supports internes). Alfred s&apos;appuiera sur ces sources pour ses rédactions.
        </p>

        {sp.kok && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Document ajouté à la base de connaissance d&apos;Alfred.</div>}
        {sp.kerr && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>{KERR[sp.kerr] ?? "Une erreur est survenue."}</div>}

        <div className="adm-row2">
          <form action={addKnowledgeFileAction} className="adm-form">
            <div className="adm-field">
              <label>Importer un document <small>(PDF, Word .docx, .txt, .md)</small></label>
              <input type="file" name="file" accept=".pdf,.docx,.txt,.md,application/pdf" required />
            </div>
            <div className="adm-field">
              <label>Titre <small>(optionnel)</small></label>
              <input name="title" placeholder="Ex. Guide DGFiP facturation électronique" />
            </div>
            <div className="adm-actions">
              <button className="adm-btn ghost" type="submit">+ Ajouter le document</button>
            </div>
          </form>

          <form action={addKnowledgeUrlAction} className="adm-form">
            <div className="adm-field">
              <label>Depuis un lien web</label>
              <input name="url" type="url" placeholder="https://…" required />
            </div>
            <div className="adm-field">
              <label>Titre <small>(optionnel)</small></label>
              <input name="title" placeholder="Ex. Page impots.gouv.fr" />
            </div>
            <div className="adm-actions">
              <button className="adm-btn ghost" type="submit">+ Ajouter la page</button>
            </div>
          </form>
        </div>

        <form action={addKnowledgeTextAction} className="adm-form" style={{ marginTop: ".6rem" }}>
          <div className="adm-field">
            <label>…ou coller du texte directement</label>
            <textarea name="text" style={{ minHeight: 90 }} placeholder="Collez ici une note, un extrait de documentation…" />
          </div>
          <input type="hidden" name="title" value="Note collée" />
          <div className="adm-actions">
            <button className="adm-btn ghost" type="submit">+ Ajouter la note</button>
          </div>
        </form>

        {docs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginTop: "1.2rem" }}>
            {docs.map((d) => (
              <div key={d.id} style={{ border: "1px solid var(--line)", borderRadius: "12px", padding: ".9rem 1.1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ minWidth: 0 }}>
                  <b>{d.title}</b>
                  <div className="muted" style={{ fontSize: ".78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.source} · {Math.round(d.text.length / 1000)} k caractères
                  </div>
                </div>
                <form action={removeKnowledgeAction}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="adm-btn danger sm" type="submit">Retirer</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

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
