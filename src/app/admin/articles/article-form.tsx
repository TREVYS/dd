import Link from "next/link";
import { saveArticleAction } from "../actions";
import { MarkdownEditor } from "../markdown-editor";
import type { ArticleInput } from "@/lib/content-admin";

export function ArticleForm({ article }: { article?: ArticleInput }) {
  const isEdit = !!article?.slug;
  return (
    <form action={saveArticleAction} className="adm-form">
      {isEdit && <input type="hidden" name="originalSlug" value={article!.slug} />}

      <div className="adm-field">
        <label>Titre</label>
        <input name="title" required defaultValue={article?.title ?? ""} placeholder="Titre de l'article" />
      </div>

      <div className="adm-row2">
        <div className="adm-field">
          <label>Thème / catégorie</label>
          <input name="category" defaultValue={article?.category ?? ""} placeholder="Fiscalité, Comptabilité…" />
        </div>
        <div className="adm-field">
          <label>Date de publication</label>
          <input type="date" name="date" defaultValue={article?.date ?? new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div className="adm-row2">
        <div className="adm-field">
          <label>Auteur <small>(optionnel)</small></label>
          <input name="author" defaultValue={article?.author ?? ""} placeholder="Trevys" />
        </div>
        <div className="adm-field">
          <label>Slug <small>(URL — laisser vide pour auto)</small></label>
          <input name="slug" defaultValue={article?.slug ?? ""} placeholder="mon-article" />
        </div>
      </div>

      <div className="adm-field">
        <label>Image (URL) <small>— ex. média WordPress</small></label>
        <input name="image" defaultValue={article?.image ?? ""} placeholder="https://www.trevys-advisory.fr/wp-content/uploads/…" />
      </div>

      <div className="adm-field">
        <label>Résumé <small>(affiché dans la liste et « En bref »)</small></label>
        <textarea name="excerpt" style={{ minHeight: 90 }} defaultValue={article?.excerpt ?? ""} placeholder="Résumé en une ou deux phrases." />
      </div>

      <div className="adm-field">
        <label>Contenu <small>(Markdown : ## Titre, - liste, **gras**, [lien](url))</small></label>
        <MarkdownEditor name="body" defaultValue={article?.body ?? ""} placeholder={"## Introduction\n\nVotre texte…"} />
      </div>

      <div className="adm-actions">
        <button className="adm-btn" type="submit">{isEdit ? "Enregistrer" : "Publier l'article"}</button>
        <Link className="adm-btn ghost" href="/admin/articles">Annuler</Link>
      </div>
    </form>
  );
}
