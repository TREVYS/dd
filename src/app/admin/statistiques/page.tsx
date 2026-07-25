import { readAnalytics, lastDays } from "@/lib/analytics";
import { buildStatsSummary, alfredTrafficAnalysis, pageLabel } from "@/lib/stats-report";
import { telegramConfigured } from "@/lib/notify";

export const dynamic = "force-dynamic";

const RANK_COLORS = ["#E8B33C", "#B9BDC7", "#C98A5A"];

export default async function AdminStats() {
  const a = readAnalytics();
  const s = buildStatsSummary();
  const analysis = await alfredTrafficAnalysis();
  const tg = telegramConfigured();
  const days = lastDays(a, 30);
  const paths = Object.entries(a.paths).sort((x, y) => y[1] - x[1]);
  const events = Object.entries(a.events).sort((x, y) => y[1] - x[1]);
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";
  const gscOn = !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const maxEvent = Math.max(1, ...events.slice(0, 5).map(([, n]) => n));

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Statistiques</h1>
          <p>L&apos;essentiel de votre audience, analysé par Alfred. {a.updatedAt && `Dernière mesure : ${new Date(a.updatedAt).toLocaleString("fr-FR")}.`}</p>
        </div>
      </div>

      {/* L'analyse d'Alfred */}
      <div className="adm-card" style={{ borderLeft: "4px solid var(--o)" }}>
        <h2>L&apos;analyse d&apos;Alfred</h2>
        <p style={{ fontSize: ".95rem", lineHeight: 1.75, margin: ".4rem 0 .8rem" }}>{analysis}</p>
        <p className="muted" style={{ fontSize: ".8rem", color: "var(--ink3)", margin: 0 }}>
          {tg
            ? "Ce résumé vous est aussi envoyé chaque semaine sur Telegram."
            : "Activez Telegram dans les Réglages pour recevoir ce résumé chaque semaine."}
        </p>
      </div>

      {/* Chiffres clés */}
      <div className="adm-grid">
        <div className="adm-kpi">
          <div className="k">Vues — 7 derniers jours</div>
          <div className="v o">
            {s.views7.toLocaleString("fr-FR")}
            {s.trendPct !== null && (
              <span style={{ fontSize: ".8rem", fontWeight: 700, marginLeft: ".5rem", color: s.trendPct >= 0 ? "#2E9E6B" : "#c0392b" }}>
                {s.trendPct >= 0 ? "▲" : "▼"} {Math.abs(s.trendPct)} %
              </span>
            )}
          </div>
        </div>
        <div className="adm-kpi"><div className="k">Engagement</div><div className="v">{s.engagementPct} %</div></div>
        <div className="adm-kpi"><div className="k">Vues (depuis le début)</div><div className="v">{s.totalViews.toLocaleString("fr-FR")}</div></div>
      </div>

      <div className="adm-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Top 3 */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>Top 3 des pages</h2>
          {s.top3.length === 0 ? (
            <p className="muted">Pas encore de données.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginTop: ".6rem" }}>
              {s.top3.map((t, i) => (
                <div key={t.path} style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: RANK_COLORS[i], color: "#fff", display: "inline-grid", placeItems: "center", fontWeight: 800, fontSize: ".8rem", flex: "none" }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: ".92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</div>
                    <div style={{ height: 7, borderRadius: 99, background: "var(--o-soft)", marginTop: ".3rem" }}>
                      <div style={{ height: "100%", width: `${Math.max(6, t.sharePct)}%`, borderRadius: 99, background: "linear-gradient(90deg,#FBB040,var(--o2))" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flex: "none" }}>
                    <div style={{ fontWeight: 800 }}>{t.views.toLocaleString("fr-FR")}</div>
                    <div className="muted" style={{ fontSize: ".74rem" }}>{t.sharePct} % des vues</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation des visiteurs */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>Ce que font vos visiteurs</h2>
          {events.length === 0 ? (
            <p className="muted">Pas encore d&apos;interactions mesurées.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", marginTop: ".6rem" }}>
              {events.slice(0, 5).map(([e, n]) => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e}</div>
                    <div style={{ height: 6, borderRadius: 99, background: "var(--o-soft)", marginTop: ".25rem" }}>
                      <div style={{ height: "100%", width: `${Math.max(5, Math.round((n / maxEvent) * 100))}%`, borderRadius: 99, background: "linear-gradient(90deg,#FBB040,var(--o2))" }} />
                    </div>
                  </div>
                  <b style={{ flex: "none" }}>{n}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Détail complet, replié par défaut */}
      <details className="adm-card" style={{ cursor: "pointer" }}>
        <summary style={{ fontWeight: 800, fontSize: "1rem" }}>Voir le détail complet (toutes les pages, jour par jour)</summary>
        <div className="adm-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem", cursor: "auto" }}>
          <div>
            <h3 style={{ margin: "0 0 .5rem" }}>Toutes les pages</h3>
            <table className="adm-table">
              <thead><tr><th>Page</th><th style={{ textAlign: "right" }}>Vues</th></tr></thead>
              <tbody>
                {paths.map(([p, n]) => (<tr key={p}><td>{pageLabel(p)}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{n}</td></tr>))}
                {paths.length === 0 && <tr><td colSpan={2} className="muted">Aucune donnée.</td></tr>}
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ margin: "0 0 .5rem" }}>30 derniers jours</h3>
            <table className="adm-table">
              <thead><tr><th>Jour</th><th style={{ textAlign: "right" }}>Vues</th><th style={{ textAlign: "right" }}>Interactions</th></tr></thead>
              <tbody>
                {days.slice().reverse().map((d) => (
                  <tr key={d.day}><td>{d.day}</td><td style={{ textAlign: "right" }}>{d.views}</td><td style={{ textAlign: "right" }}>{d.events}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* Google, replié aussi : utile mais pas quotidien */}
      <details className="adm-card" style={{ cursor: "pointer" }}>
        <summary style={{ fontWeight: 800, fontSize: "1rem" }}>Google Analytics &amp; Search Console</summary>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem", cursor: "auto" }}>
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", fontWeight: 800 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: gaId ? "#2E9E6B" : "#E26A0F" }} />
              Google Analytics 4
            </div>
            <p className="muted" style={{ fontSize: ".84rem", color: "var(--ink3)", margin: ".5rem 0 .8rem", lineHeight: 1.55 }}>
              {gaId
                ? <>Connecté — identifiant <code>{gaId}</code>.</>
                : <>Ajoutez <code>NEXT_PUBLIC_GA_ID=G-XXXXXXX</code> sur l&apos;instance, puis redéployez.</>}
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
                ? <>Balise de vérification en place.</>
                : <>Ajoutez <code>NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=…</code>, redéployez, puis validez.</>}
            </p>
            <a className="adm-btn ghost sm" href="https://search.google.com/search-console" target="_blank" rel="noopener">Ouvrir Search Console</a>
          </div>
        </div>
      </details>
    </>
  );
}
