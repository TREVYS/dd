import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { listPages } from "@/lib/content-admin";
import { readAnalytics, lastDays } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const posts = getAllPosts();
  const pages = listPages();
  const a = readAnalytics();
  const days = lastDays(a, 14);
  const max = Math.max(1, ...days.map((d) => d.views));
  const topPaths = Object.entries(a.paths).sort((x, y) => y[1] - x[1]).slice(0, 6);
  const events = Object.entries(a.events).sort((x, y) => y[1] - x[1]);

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Tableau de bord</h1>
          <p>Pilotage de votre site — contenu et audience.</p>
        </div>
        <Link className="adm-btn" href="/admin/articles/new">+ Nouvel article</Link>
      </div>

      <div className="adm-grid">
        <div className="adm-kpi"><div className="k">Vues (total)</div><div className="v o">{a.totals.views.toLocaleString("fr-FR")}</div></div>
        <div className="adm-kpi"><div className="k">Interactions</div><div className="v">{a.totals.events.toLocaleString("fr-FR")}</div></div>
        <div className="adm-kpi"><div className="k">Articles publiés</div><div className="v">{posts.length}</div></div>
        <div className="adm-kpi"><div className="k">Pages personnalisées</div><div className="v">{pages.length}</div></div>
      </div>

      <div className="adm-card">
        <h2>Vues des 14 derniers jours</h2>
        <div className="adm-bars">
          {days.map((d) => (
            <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div className="adm-bar" style={{ height: `${(d.views / max) * 100}%` }} title={`${d.day} · ${d.views} vues`} />
              <div className="lbl">{d.day.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="adm-card">
          <h2>Pages les plus vues</h2>
          {topPaths.length === 0 ? (
            <p className="muted" style={{ color: "var(--ink3)" }}>Aucune donnée pour l&apos;instant.</p>
          ) : (
            <table className="adm-table">
              <tbody>
                {topPaths.map(([p, n]) => (
                  <tr key={p}><td>{p}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="adm-card">
          <h2>Interactions clés</h2>
          {events.length === 0 ? (
            <p className="muted" style={{ color: "var(--ink3)" }}>Aucune interaction enregistrée.</p>
          ) : (
            <table className="adm-table">
              <tbody>
                {events.map(([e, n]) => (
                  <tr key={e}><td>{e}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
