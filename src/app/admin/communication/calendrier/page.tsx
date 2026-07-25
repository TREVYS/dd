import { BrouillonsTabs } from "../brouillons-tabs";
import Link from "next/link";
import { listItems } from "@/lib/editorial";
import { addCalendarAction, deleteCalendarAction, publishDraftAction } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  article: "Article", linkedin: "LinkedIn", instagram: "Instagram", newsletter: "Newsletter", idee: "Idée",
};
const STATUS_LABEL: Record<string, string> = {
  idee: "Idée", brouillon: "Brouillon", planifie: "Planifié", publie: "Publié",
};

function statusClass(s: string) {
  return s === "publie" ? "pub" : s === "brouillon" ? "draft" : "";
}

export default function CalendrierPage() {
  // Uniquement les brouillons d'articles (les posts et newsletters ont leurs
  // propres modules). Les articles publiés vivent dans « Articles ».
  const items = listItems().filter((it) => it.type === "article" && it.status !== "publie");
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Brouillons</h1>
          <p>Les propositions d&apos;Alfred et vos idées en préparation. Une fois publié, l&apos;article rejoint la rubrique Articles et sort de cette liste.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication">← Directeur de comm</Link>
      </div>

      <BrouillonsTabs />

      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Ajouter une idée d&apos;article</h2>
        <form action={addCalendarAction} className="adm-actions" style={{ alignItems: "flex-end", gap: ".7rem", flexWrap: "wrap" }}>
          <div className="adm-field" style={{ margin: 0 }}>
            <label>Date</label>
            <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <input type="hidden" name="type" value="article" />
          <div className="adm-field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label>Titre</label>
            <input name="title" placeholder="Sujet / titre de l&apos;article à préparer" required />
          </div>
          <button className="adm-btn" type="submit">Ajouter</button>
        </form>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr><th>Date</th><th>Titre</th><th>Statut</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="muted" style={{ paddingLeft: "1.1rem", whiteSpace: "nowrap" }}>{it.date}</td>
                <td style={{ fontWeight: 600 }}>
                  {it.type === "article" && it.status === "publie" && it.slug ? (
                    <Link href={`/admin/articles/${it.slug}`} className="adm-link">{it.title}</Link>
                  ) : it.type === "article" ? (
                    <Link href={`/admin/communication/calendrier/${it.id}`} className="adm-link">{it.title}</Link>
                  ) : (
                    it.title
                  )}
                  {it.slug && <span className="muted"> · /blog/{it.slug}</span>}
                </td>
                <td><span className={`adm-chipst ${statusClass(it.status)}`}>{STATUS_LABEL[it.status] ?? it.status}</span></td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end" }}>
                    {it.type === "article" && it.status === "publie" && it.slug && (
                      <Link className="adm-btn ghost sm" href={`/admin/articles/${it.slug}`}>Ouvrir</Link>
                    )}
                    {it.type === "article" && it.status !== "publie" && (
                      <Link className="adm-btn ghost sm" href={`/admin/communication/calendrier/${it.id}`}>Éditer</Link>
                    )}
                    {it.type === "article" && it.body && it.status !== "publie" && (
                      <form action={publishDraftAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <button className="adm-btn sm" type="submit">Publier sur le site</button>
                      </form>
                    )}
                    <form action={deleteCalendarAction}>
                      <input type="hidden" name="id" value={it.id} />
                      <button className="adm-btn danger sm" type="submit">Suppr.</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ padding: "1.4rem" }}>
                Aucun brouillon. Commandez un article à Alfred (chat ou Telegram) — il apparaîtra ici pour relecture avant publication.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
