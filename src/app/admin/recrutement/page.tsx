import Link from "next/link";
import { listJobs, listApplications } from "@/lib/jobs";
import { toggleJobAction, deleteJobAction, markAppReadAction, deleteAppAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function RecrutementAdmin({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const sp = await searchParams;
  const jobs = listJobs();
  const apps = listApplications();
  const unread = apps.filter((a) => !a.read).length;

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Recrutement {unread > 0 && <span className="adm-soon" style={{ background: "#E26A0F", color: "#fff" }}>{unread} candidature{unread > 1 ? "s" : ""}</span>}</h1>
          <p>Vos offres d&apos;emploi (page « Nous rejoindre ») et les candidatures reçues.</p>
        </div>
        <Link className="adm-btn" href="/admin/recrutement/new">+ Nouvelle offre</Link>
      </div>

      {sp.ok && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Offre enregistrée.</div>}

      <div className="adm-card" style={{ padding: 0, marginBottom: "1.4rem" }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "1.1rem" }}>Offre</th>
              <th>Statut</th>
              <th>👁 Vues</th>
              <th>🧑‍💼 Candidatures</th>
              <th style={{ textAlign: "right", paddingRight: "1.1rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td style={{ paddingLeft: "1.1rem" }}>
                  <Link href={`/admin/recrutement/${j.id}`} className="adm-link" style={{ fontWeight: 700 }}>{j.title}</Link>
                  <div className="muted">{j.category} · {j.contract} · {j.location}</div>
                </td>
                <td>
                  <span className={`adm-chipst ${j.status === "publie" ? "pub" : "draft"}`}>
                    {j.status === "publie" ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{j.views ?? 0}</td>
                <td style={{ fontWeight: 700 }}>{j.applications ?? 0}</td>
                <td>
                  <div className="adm-actions" style={{ justifyContent: "flex-end", paddingRight: "1.1rem", flexWrap: "wrap" }}>
                    {j.status === "publie" && (
                      <Link className="adm-btn ghost sm" href={`/nous-rejoindre/${j.slug}`} target="_blank">Voir</Link>
                    )}
                    <Link className="adm-btn ghost sm" href={`/admin/recrutement/${j.id}`}>Modifier</Link>
                    <form action={toggleJobAction}>
                      <input type="hidden" name="id" value={j.id} />
                      <button className="adm-btn ghost sm" type="submit">{j.status === "publie" ? "Dépublier" : "Publier"}</button>
                    </form>
                    <form action={deleteJobAction}>
                      <input type="hidden" name="id" value={j.id} />
                      <button className="adm-btn danger sm" type="submit">Suppr.</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ padding: "1.2rem" }}>Aucune offre. Créez-en une, ou demandez à Alfred : « rédige une offre de… »</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-h" style={{ marginTop: "1.6rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem" }}>Candidatures</h1>
          <p>{apps.length} candidature{apps.length > 1 ? "s" : ""} reçue{apps.length > 1 ? "s" : ""} au total.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
        {apps.map((a) => (
          <div key={a.id} className="adm-card" style={{ borderLeft: a.read ? undefined : "4px solid #E26A0F" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800 }}>
                {!a.read && <span style={{ color: "#E26A0F", marginRight: ".4rem" }}>●</span>}
                {a.name}
                <span className="muted" style={{ fontWeight: 500, marginLeft: ".6rem", fontSize: ".84rem" }}>
                  {new Date(a.date).toLocaleString("fr-FR")}
                </span>
              </div>
              <span className="adm-tag">{a.jobTitle}</span>
            </div>
            <div className="muted" style={{ fontSize: ".86rem", margin: ".35rem 0 .7rem" }}>
              <a href={`mailto:${a.email}`} className="adm-link">{a.email}</a>
              {a.phone && <> · {a.phone}</>}
              {a.linkedin && <> · <a href={a.linkedin} target="_blank" rel="noopener" className="adm-link">LinkedIn</a></>}
            </div>
            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--ink2)", lineHeight: 1.6 }}>{a.message}</p>
            <div className="adm-actions" style={{ marginTop: ".9rem" }}>
              <a className="adm-btn sm" href={`mailto:${a.email}?subject=${encodeURIComponent(`Votre candidature — ${a.jobTitle} — Trevys`)}`}>
                Répondre
              </a>
              {!a.read && (
                <form action={markAppReadAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="adm-btn ghost sm" type="submit">Marquer comme lue</button>
                </form>
              )}
              <form action={deleteAppAction}>
                <input type="hidden" name="id" value={a.id} />
                <button className="adm-btn danger sm" type="submit">Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {apps.length === 0 && (
          <div className="adm-card"><p className="muted" style={{ margin: 0 }}>Aucune candidature pour l&apos;instant.</p></div>
        )}
      </div>
    </>
  );
}
