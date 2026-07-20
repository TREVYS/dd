import Link from "next/link";
import { savePageAction } from "../actions";
import { MarkdownEditor } from "../markdown-editor";
import type { PageInput } from "@/lib/content-admin";

export function PageForm({ page }: { page?: PageInput }) {
  const isEdit = !!page?.slug;
  return (
    <form action={savePageAction} className="adm-form">
      {isEdit && <input type="hidden" name="originalSlug" value={page!.slug} />}
      <div className="adm-field">
        <label>Titre</label>
        <input name="title" required defaultValue={page?.title ?? ""} placeholder="Titre de la page" />
      </div>
      <div className="adm-field">
        <label>Slug <small>(URL — laisser vide pour auto)</small></label>
        <input name="slug" defaultValue={page?.slug ?? ""} placeholder="ma-page" />
      </div>
      <div className="adm-field">
        <label>Description SEO <small>(optionnel)</small></label>
        <textarea name="description" style={{ minHeight: 80 }} defaultValue={page?.description ?? ""} />
      </div>
      <div className="adm-field">
        <label style={{ flexDirection: "row", display: "flex", alignItems: "center", gap: ".6rem" }}>
          <input type="checkbox" name="menu" value="1" defaultChecked={page?.menu} style={{ width: "auto" }} />
          Afficher cette page dans le menu du site
        </label>
      </div>
      <div className="adm-field">
        <label>Contenu <small>(Markdown)</small></label>
        <MarkdownEditor name="body" defaultValue={page?.body ?? ""} placeholder={"## Titre\n\nVotre contenu…"} />
      </div>
      <div className="adm-actions">
        <button className="adm-btn" type="submit">{isEdit ? "Enregistrer" : "Créer la page"}</button>
        <Link className="adm-btn ghost" href="/admin/pages">Annuler</Link>
      </div>
    </form>
  );
}
