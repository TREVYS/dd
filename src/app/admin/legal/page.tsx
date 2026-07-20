import Link from "next/link";
import { listLegalDocs, formatUpdated } from "@/lib/legal";

export const dynamic = "force-dynamic";

export default function AdminLegal() {
  const docs = listLegalDocs();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Pages légales</h1>
          <p>Mentions légales et autres documents réglementaires.</p>
        </div>
      </div>
      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead><tr><th>Document</th><th>Mise à jour</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.slug}>
                <td style={{ paddingLeft: "1.2rem", fontWeight: 700 }}>{d.title}</td>
                <td className="muted">{d.updated ? formatUpdated(d.updated) : "—"}</td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end" }}>
                    <Link className="adm-btn ghost sm" href={`/${d.slug}`} target="_blank">Voir</Link>
                    <Link className="adm-btn ghost sm" href={`/admin/legal/${d.slug}`}>Modifier</Link>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={3} className="muted" style={{ padding: "1.4rem" }}>Aucun document.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
