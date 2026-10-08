import { parisToday } from "@/lib/dates";
import Link from "next/link";
import { saveArticleAction, translateArticleAction, saveArticleTranslationAction } from "../actions";
import { MarkdownEditor } from "../markdown-editor";
import { ImageField } from "../image-field";
import { ArticleDiffusion } from "./article-diffusion";
import { PendingButton } from "../pending-button";
import type { ArticleInput } from "@/lib/content-admin";
import { getAllPosts } from "@/lib/blog";
import { METIERS, metierOf } from "@/lib/metier";
export function ArticleForm({
  article,
  translation,
  translateError,
}: {
  article?: ArticleInput;
  translation?: { title: string; excerpt: string; body: string } | null;
  translateError?: boolean;
}) {
  const isEdit = !!article?.slug;
  // Catégories déjà utilisées (les plus fréquentes d'abord) : suggérées
  // pendant la saisie, sans empêcher d'en créer une nouvelle.
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) {
    const c = p.category.trim();
    if (c && c.toLowerCase() !== "uncategorized") counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const categories = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  return (
    <>
    <form action={saveArticleAction} className="adm-form">
      {isEdit && <input type="hidden" name="originalSlug" value={article!.slug} />}

      <div className="adm-field">
        <label>Titre</label>
        <input name="title" required defaultValue={article?.title ?? ""} placeholder="Titre de l'article" />
      </div>

      <div className="adm-row2">
        <div className="adm-field">
          <label>Thème / catégorie</label>
          <input
            name="category"
            defaultValue={article?.category ?? ""}
            placeholder="Fiscalité, Comptabilité…"
            list="admin-categories"
            autoComplete="off"
          />
          <datalist id="admin-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="adm-field">
          <label>Date de publication</label>
          <input type="date" name="date" defaultValue={article?.date ?? parisToday()} />
        </div>
      </div>

      <div className="adm-field">
        <label>Étiquette métier <small>(affichée dans la newsletter — « Automatique » la déduit de la catégorie)</small></label>
        <select name="metier" defaultValue={article?.metier ?? ""}>
          <option value="">
            Automatique{article?.category ? ` (${metierOf(article.category)})` : ""}
          </option>
          {METIERS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
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
        <label>Image de couverture <small>— importez un fichier ou collez une URL</small></label>
        <ImageField name="image" defaultValue={article?.image ?? ""} />
      </div>

      <div className="adm-field">
        <label>Résumé <small>(affiché dans la liste et « En bref »)</small></label>
        <textarea name="excerpt" style={{ minHeight: 90 }} defaultValue={article?.excerpt ?? ""} placeholder="Résumé en une ou deux phrases." />
      </div>

      <div className="adm-field">
        <label>Contenu <small>— servez-vous de la barre d&apos;outils pour mettre en forme (titres, gras, listes, image, pièce jointe). Pas besoin de connaître le code.</small></label>
        <MarkdownEditor name="body" defaultValue={article?.body ?? ""} placeholder={"## Introduction\n\nVotre texte…"} />
      </div>

      <div className="adm-actions">
        <button className="adm-btn" type="submit">{isEdit ? "Enregistrer" : "Publier l'article"}</button>
        <Link className="adm-btn ghost" href="/admin/articles">Annuler</Link>
      </div>
    </form>

    {isEdit && (
      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Version anglaise <small className="muted">— publiée sur /en/blog/{article!.slug}</small></h2>
        {translateError && (
          <div className="adm-note" style={{ margin: ".8rem 0", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
            Alfred n&apos;a pas pu traduire cet article (voir sa configuration dans les Réglages). Réessayez dans un instant.
          </div>
        )}
        {translation ? (
          <form action={saveArticleTranslationAction} style={{ marginTop: ".8rem" }}>
            <input type="hidden" name="slug" value={article!.slug} />
            <div className="adm-field">
              <label>Title</label>
              <input name="titleEn" defaultValue={translation.title} placeholder="English title" />
            </div>
            <div className="adm-field">
              <label>Excerpt</label>
              <textarea name="excerptEn" style={{ minHeight: 90 }} defaultValue={translation.excerpt} placeholder="One or two sentences." />
            </div>
            <div className="adm-field">
              <label>Content</label>
              <MarkdownEditor name="bodyEn" defaultValue={translation.body} placeholder={"## Introduction\n\nYour text…"} />
            </div>
            <div className="adm-actions">
              <button className="adm-btn" type="submit">Enregistrer la version anglaise</button>
            </div>
          </form>
        ) : (
          <p className="muted" style={{ margin: ".8rem 0 0" }}>Pas encore de traduction publiée.</p>
        )}
        <form action={translateArticleAction} style={{ marginTop: ".8rem" }}>
          <input type="hidden" name="slug" value={article!.slug} />
          <PendingButton pendingLabel="Alfred traduit…" className="adm-btn ghost">
            {translation ? "Retraduire en anglais avec Alfred" : "Traduire en anglais avec Alfred"}
          </PendingButton>
        </form>
      </div>
    )}

    {isEdit && (
      <ArticleDiffusion
        title={article?.title ?? ""}
        excerpt={article?.excerpt ?? ""}
        url={article?.slug ? `https://www.trevys.fr/blog/${article.slug}` : undefined}
      />
    )}
    </>
  );
}
