import Link from "next/link";
import { notFound } from "next/navigation";
import { getItem } from "@/lib/editorial";
import { MarkdownEditor } from "../../../markdown-editor";
import { ImageField } from "../../../image-field";
import { ArticleDiffusion } from "../../../articles/article-diffusion";
import { updateDraftAction, publishDraftAction, translateDraftAction } from "../actions";
import { PendingButton } from "../../../pending-button";

export const dynamic = "force-dynamic";

export default async function EditDraft({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const item = getItem(id);
  if (!item) notFound();

  // Un article déjà publié s'édite dans le module Articles.
  if (item.type === "article" && item.status === "publie" && item.slug) {
    return (
      <>
        <div className="adm-h">
          <div>
            <h1>{item.title}</h1>
            <p>Cet article est publié — modifiez-le dans le module Articles.</p>
          </div>
        </div>
        <div className="adm-actions">
          <Link className="adm-btn" href={`/admin/articles/${item.slug}`}>Ouvrir dans les articles</Link>
          <Link className="adm-btn ghost" href={`/blog/${item.slug}`} target="_blank">Voir sur le site</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Éditer le brouillon</h1>
          <p>{item.date} · brouillon d&apos;article — modifiez, puis publiez sur le site.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication/calendrier">← Calendrier</Link>
      </div>

      <form action={updateDraftAction} className="adm-form">
        <input type="hidden" name="id" value={item.id} />

        <div className="adm-field">
          <label>Titre</label>
          <input name="title" required defaultValue={item.title} placeholder="Titre de l'article" />
        </div>

        <div className="adm-row2">
          <div className="adm-field">
            <label>Thème / catégorie</label>
            <input name="category" defaultValue={item.category ?? ""} placeholder="Fiscalité, Comptabilité…" />
          </div>
        </div>

        <div className="adm-field">
          <label>Image de couverture <small>— choisissez dans la médiathèque ou importez</small></label>
          <ImageField name="image" defaultValue={item.image ?? ""} />
        </div>

        <div className="adm-field">
          <label>Résumé <small>(affiché dans la liste et « En bref »)</small></label>
          <textarea name="excerpt" style={{ minHeight: 90 }} defaultValue={item.excerpt ?? ""} placeholder="Résumé en une ou deux phrases." />
        </div>

        <div className="adm-field">
          <label>Contenu <small>— barre d&apos;outils pour la mise en forme. Pas besoin de code.</small></label>
          <MarkdownEditor name="body" defaultValue={item.body ?? ""} placeholder={"## Introduction\n\nVotre texte…"} />
        </div>

        <div className="adm-card" style={{ marginTop: "1.2rem" }}>
          <h2>Version anglaise <small className="muted">— rédigée par Alfred, à relire</small></h2>
          {item.bodyEn || item.titleEn ? (
            <>
              <div className="adm-field" style={{ marginTop: ".8rem" }}>
                <label>Title</label>
                <input name="titleEn" defaultValue={item.titleEn ?? ""} placeholder="English title" />
              </div>
              <div className="adm-field">
                <label>Excerpt</label>
                <textarea name="excerptEn" style={{ minHeight: 90 }} defaultValue={item.excerptEn ?? ""} placeholder="One or two sentences." />
              </div>
              <div className="adm-field">
                <label>Content</label>
                <MarkdownEditor name="bodyEn" defaultValue={item.bodyEn ?? ""} placeholder={"## Introduction\n\nYour text…"} />
              </div>
            </>
          ) : (
            <p className="muted" style={{ margin: ".8rem 0 0" }}>
              Pas encore de traduction — enregistrez d&apos;abord vos modifications ci-dessus, puis traduisez.
            </p>
          )}
        </div>

        <div className="adm-actions">
          <button className="adm-btn" type="submit">Enregistrer le brouillon</button>
          <Link className="adm-btn ghost" href="/admin/communication/calendrier">Annuler</Link>
        </div>
      </form>

      {/* Traduction : formulaire séparé pour ne pas imbriquer les formulaires */}
      {error === "translate" && (
        <div className="adm-note" style={{ marginTop: ".8rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          Alfred n&apos;a pas pu traduire cet article (voir sa configuration dans les Réglages). Réessayez dans un instant.
        </div>
      )}
      <form action={translateDraftAction} style={{ marginTop: ".8rem" }}>
        <input type="hidden" name="id" value={item.id} />
        <PendingButton pendingLabel="Alfred traduit…" className="adm-btn ghost" disabled={!item.body}>
          {item.bodyEn ? "Retraduire en anglais" : "Traduire en anglais avec Alfred"}
        </PendingButton>
      </form>

      {/* Publication : formulaire séparé pour ne pas imbriquer les formulaires */}
      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Publier sur le site</h2>
        <p className="muted" style={{ marginTop: ".3rem" }}>
          Crée l&apos;article dans le blog. Pensez à enregistrer vos modifications avant de publier.
        </p>
        <form action={publishDraftAction} style={{ marginTop: ".6rem" }}>
          <input type="hidden" name="id" value={item.id} />
          <button className="adm-btn" type="submit" disabled={!item.body}>Publier sur le site</button>
        </form>
      </div>

      {/* Diffusion réseaux sociaux (brouillon ou planifié selon la date) */}
      <ArticleDiffusion title={item.title} excerpt={item.excerpt ?? ""} />
    </>
  );
}
