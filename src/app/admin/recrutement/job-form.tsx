import Link from "next/link";
import type { Job } from "@/lib/jobs";
import { MarkdownEditor } from "../markdown-editor";
import { ArticleDiffusion } from "../articles/article-diffusion";
import { saveJobAction } from "./actions";

// Formulaire d'offre d'emploi : création / édition, avec l'éditeur assisté
// par Alfred et la diffusion réseaux (pour les offres existantes).
export function JobForm({ job }: { job?: Job }) {
  return (
    <>
      <form action={saveJobAction} className="adm-form">
        {job && <input type="hidden" name="id" value={job.id} />}

        <div className="adm-field">
          <label>Intitulé du poste</label>
          <input name="title" required defaultValue={job?.title ?? ""} placeholder="Ex. Consultant en expertise comptable & conseil (H/F)" />
        </div>

        <div className="adm-row2">
          <div className="adm-field">
            <label>Métier</label>
            <select name="category" defaultValue={job?.category ?? "Expertise comptable"}>
              <option>Expertise comptable</option>
              <option>Conseil</option>
              <option>Support & fonctions transverses</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Contrat</label>
            <select name="contract" defaultValue={job?.contract ?? "CDI"}>
              <option>CDI</option>
              <option>CDD</option>
              <option>Alternance</option>
              <option>Stage</option>
              <option>Freelance</option>
            </select>
          </div>
        </div>

        <div className="adm-row2">
          <div className="adm-field">
            <label>Lieu</label>
            <input name="location" defaultValue={job?.location ?? "Paris 16e"} />
          </div>
          <div className="adm-field">
            <label>Statut</label>
            <select name="status" defaultValue={job?.status ?? "brouillon"}>
              <option value="brouillon">Brouillon (invisible sur le site)</option>
              <option value="publie">Publié (visible sur /nous-rejoindre)</option>
            </select>
          </div>
        </div>

        <div className="adm-field">
          <label>Accroche <small>(affichée dans la liste des offres et les partages)</small></label>
          <textarea name="summary" required style={{ minHeight: 80 }} defaultValue={job?.summary ?? ""}
            placeholder="Une ou deux phrases qui donnent envie de lire l'offre." />
        </div>

        <div className="adm-field">
          <label>Contenu de l&apos;offre <small>— barre d&apos;outils pour la mise en forme, et Alfred pour améliorer le texte.</small></label>
          <MarkdownEditor name="body" defaultValue={job?.body ?? ""} placeholder={"## Vos missions\n\n- …\n\n## Le profil recherché\n\n- …"} />
        </div>

        <div className="adm-actions">
          <button className="adm-btn" type="submit">{job ? "Enregistrer" : "Créer l'offre"}</button>
          <Link className="adm-btn ghost" href="/admin/recrutement">Annuler</Link>
        </div>
      </form>

      {job && (
        <ArticleDiffusion
          title={`On recrute : ${job.title}`}
          excerpt={`${job.summary} Candidature : https://www.trevys.fr/nous-rejoindre/${job.slug}`}
        />
      )}
    </>
  );
}
