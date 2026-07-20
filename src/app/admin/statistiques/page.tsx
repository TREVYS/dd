import { readAnalytics, lastDays } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function AdminStats() {
  const a = readAnalytics();
  const days = lastDays(a, 30);
  const paths = Object.entries(a.paths).sort((x, y) => y[1] - x[1]);
  const events = Object.entries(a.events).sort((x, y) => y[1] - x[1]);

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Statistiques</h1>
          <p>Audience et interactions. {a.updatedAt && `Dernière mesure : ${new Date(a.updatedAt).toLocaleString("fr-FR")}.`}</p>
        </div>
      </div>

      <div className="adm-grid">
        <div className="adm-kpi"><div className="k">Vues (total)</div><div className="v o">{a.totals.views.toLocaleString("fr-FR")}</div></div>
        <div className="adm-kpi"><div className="k">Interactions</div><div className="v">{a.totals.events.toLocaleString("fr-FR")}</div></div>
        <div className="adm-kpi"><div className="k">Jours suivis</div><div className="v">{Object.keys(a.days).length}</div></div>
      </div>

      <div className="adm-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="adm-card">
          <h2>Toutes les pages</h2>
          <table className="adm-table">
            <thead><tr><th>Page</th><th style={{ textAlign: "right" }}>Vues</th></tr></thead>
            <tbody>
              {paths.map(([p, n]) => (<tr key={p}><td>{p}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td></tr>))}
              {paths.length === 0 && <tr><td colSpan={2} className="muted">Aucune donnée.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="adm-card">
          <h2>Interactions</h2>
          <table className="adm-table">
            <thead><tr><th>Événement</th><th style={{ textAlign: "right" }}>Nombre</th></tr></thead>
            <tbody>
              {events.map(([e, n]) => (<tr key={e}><td>{e}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td></tr>))}
              {events.length === 0 && <tr><td colSpan={2} className="muted">Aucune donnée.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="adm-card">
        <h2>30 derniers jours</h2>
        <table className="adm-table">
          <thead><tr><th>Jour</th><th style={{ textAlign: "right" }}>Vues</th><th style={{ textAlign: "right" }}>Interactions</th></tr></thead>
          <tbody>
            {days.slice().reverse().map((d) => (
              <tr key={d.day}><td>{d.day}</td><td style={{ textAlign: "right" }}>{d.views}</td><td style={{ textAlign: "right" }}>{d.events}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
