import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegalDoc } from "@/lib/legal";
import { saveLegalAction } from "../../actions";
import { MarkdownEditor } from "../../markdown-editor";

export const dynamic = "force-dynamic";

export default async function EditLegal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Modifier — {doc.title}</h1>
          <p>/{slug}</p>
        </div>
      </div>
      <form action={saveLegalAction} className="adm-form">
        <input type="hidden" name="slug" value={slug} />
        <div className="adm-field">
          <label>Titre</label>
          <input name="title" required defaultValue={doc.title} />
        </div>
        <div className="adm-field">
          <label>Contenu <small>(Markdown) — la date de mise à jour est enregistrée automatiquement</small></label>
          <MarkdownEditor name="body" defaultValue={doc.content.trim()} />
        </div>
        <div className="adm-actions">
          <button className="adm-btn" type="submit">Enregistrer</button>
          <Link className="adm-btn ghost" href="/admin/legal">Annuler</Link>
        </div>
      </form>
    </>
  );
}
