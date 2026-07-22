import { readAnalytics, lastDays } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function AdminStats() {
  const a = readAnalytics();
  const days = lastDays(a, 30);
  const paths = Object.entries(a.paths).sort((x, y) => y[1] - x[1]);
  const events = Object.entries(a.events).sort((x, y) => y[1] - x[1]);
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";
  const gscOn = !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Statistiques</h1>
          <p>Audience et interactions. {a.updatedAt && `Dernière mesure : ${new Date(a.updatedAt).toLocaleString("fr-FR")}.`}</p>
        </div>
      </div>

      <div className="adm-card">
        <h2>Google Analytics &amp; Search Console</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".88rem", lineHeight: 1.6, margin: "0 0 1rem" }}>
          Reliez votre site aux outils Google pour un suivi d&apos;audience détaillé (visiteurs, sources, conversions)
          et le référencement (mots-clés, indexation).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", fontWeight: 800 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: gaId ? "#2E9E6B" : "#E26A0F" }} />
              Google Analytics 4
            </div>
            <p className="muted" style={{ fontSize: ".84rem", color: "var(--ink3)", margin: ".5rem 0 .8rem", lineHeight: 1.55 }}>
              {gaId
                ? <>Connecté — identifiant <code>{gaId}</code>. Consultez vos données dans Google.</>
                : <>Ajoutez la variable <code>NEXT_PUBLIC_GA_ID=G-XXXXXXX</code> sur l&apos;instance (<code>~/.env.trevys</code>), puis redéployez.</>}
            </p>
            <a className="adm-btn ghost sm" href="https://analytics.google.com/" target="_blank" rel="noopener">Ouvrir Analytics</a>
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", fontWeight: 800 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: gscOn ? "#2E9E6B" : "#E26A0F" }} />
              Search Console
            </div>
            <p className="muted" style={{ fontSize: ".84rem", color: "var(--ink3)", margin: ".5rem 0 .8rem", lineHeight: 1.55 }}>
              {gscOn
                ? <>Balise de vérification en place. Validez la propriété dans Search Console.</>
                : <>Ajoutez <code>NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=…</code> (code fourni par Google), redéployez, puis validez.</>}
            </p>
            <a className="adm-btn ghost sm" href="https://search.google.com/search-console" target="_blank" rel="noopener">Ouvrir Search Console</a>
          </div>
        </div>
        <p className="muted" style={{ fontSize: ".8rem", color: "var(--ink3)", marginTop: "1rem" }}>
          Les compteurs ci-dessous restent alimentés en direct par votre site (sans cookie tiers), en complément de Google.
        </p>
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
