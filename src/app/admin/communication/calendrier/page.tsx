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
  // Les articles déjà publiés vivent dans « Articles » — on ne garde ici que le travail en cours.
  const items = listItems().filter((it) => !(it.type === "article" && it.status === "publie"));
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Brouillons d&apos;articles</h1>
          <p>Les propositions d&apos;Alfred et vos idées en préparation. Une fois publié, l&apos;article rejoint la rubrique Articles et sort de cette liste.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication">← Directeur de comm</Link>
      </div>

      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Ajouter une échéance</h2>
        <form action={addCalendarAction} className="adm-actions" style={{ alignItems: "flex-end", gap: ".7rem", flexWrap: "wrap" }}>
          <div className="adm-field" style={{ margin: 0 }}>
            <label>Date</label>
            <input type="date" name="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="adm-field" style={{ margin: 0 }}>
            <label>Type</label>
            <select name="type">
              <option value="article">Article</option>
              <option value="linkedin">Post LinkedIn</option>
              <option value="instagram">Post Instagram</option>
              <option value="newsletter">Newsletter</option>
              <option value="idee">Idée</option>
            </select>
          </div>
          <div className="adm-field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label>Titre</label>
            <input name="title" placeholder="Sujet / titre" required />
          </div>
          <button className="adm-btn" type="submit">Ajouter</button>
        </form>
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr><th>Date</th><th>Type</th><th>Titre</th><th>Statut</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="muted" style={{ paddingLeft: "1.1rem", whiteSpace: "nowrap" }}>{it.date}</td>
                <td><span className="adm-tag">{TYPE_LABEL[it.type] ?? it.type}</span></td>
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
              <tr><td colSpan={5} className="muted" style={{ padding: "1.4rem" }}>
                Rien pour l&apos;instant. Demandez au <Link href="/admin/communication">Directeur de comm</Link> de vous proposer un calendrier !
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
