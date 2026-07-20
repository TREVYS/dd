import Link from "next/link";
import { listPages } from "@/lib/content-admin";
import { deletePageAction } from "../actions";

export const dynamic = "force-dynamic";

export default function AdminPages() {
  const pages = listPages();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Pages</h1>
          <p>Créez des pages supplémentaires, publiées sur <code>/p/&lt;slug&gt;</code>.</p>
        </div>
        <Link className="adm-btn" href="/admin/pages/new">+ Nouvelle page</Link>
      </div>

      <div className="adm-note" style={{ marginBottom: "1.4rem" }}>
        Les pages créées ici sont accessibles à l&apos;adresse <b>/p/&lt;slug&gt;</b>.
        Pour les mettre dans le menu principal, indiquez-moi lesquelles.
      </div>

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr><th>Titre</th><th>Adresse</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}>
                <td style={{ paddingLeft: "1.2rem", fontWeight: 700 }}>{p.title}</td>
                <td className="muted">/p/{p.slug}</td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end" }}>
                    <Link className="adm-btn ghost sm" href={`/p/${p.slug}`} target="_blank">Voir</Link>
                    <Link className="adm-btn ghost sm" href={`/admin/pages/${p.slug}`}>Modifier</Link>
                    <form action={deletePageAction}>
                      <input type="hidden" name="slug" value={p.slug} />
                      <button className="adm-btn danger sm" type="submit">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={3} className="muted" style={{ padding: "1.4rem" }}>Aucune page personnalisée pour l&apos;instant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
