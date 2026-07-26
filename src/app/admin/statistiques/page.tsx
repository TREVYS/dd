import { readAnalytics, lastDays } from "@/lib/analytics";
import Link from "next/link";
import { buildStatsSummary, alfredTrafficAnalysis, pageLabel, periodStats, type Periode } from "@/lib/stats-report";
import { telegramConfigured } from "@/lib/notify";

export const dynamic = "force-dynamic";

const RANK_COLORS = ["#E8B33C", "#B9BDC7", "#C98A5A"];

const PERIODES: { id: Periode; label: string }[] = [
  { id: "jour", label: "Jour" },
  { id: "semaine", label: "Semaine" },
  { id: "mois", label: "Mois" },
  { id: "annee", label: "Année" },
];

export default async function AdminStats({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const sp = await searchParams;
  const periode: Periode = (["jour", "semaine", "mois", "annee"].includes(sp.periode ?? "") ? sp.periode : "semaine") as Periode;
  const a = readAnalytics();
  const ps = periodStats(a, periode);
  const maxSerie = Math.max(1, ...ps.series.map((x) => x.views));
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

      {/* Période d'analyse */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        {PERIODES.map((pp) => (
          <Link
            key={pp.id}
            href={`/admin/statistiques?periode=${pp.id}`}
            className={periode === pp.id ? "adm-btn sm" : "adm-btn ghost sm"}
          >
            {pp.label}
          </Link>
        ))}
      </div>

      {/* Chiffres clés */}
      <div className="adm-grid">
        <div className="adm-kpi">
          <div className="k">Vues — {ps.label}</div>
          <div className="v o">
            {ps.views.toLocaleString("fr-FR")}
            {ps.trendPct !== null && (
              <span style={{ fontSize: ".8rem", fontWeight: 700, marginLeft: ".5rem", color: ps.trendPct >= 0 ? "#2E9E6B" : "#c0392b" }}>
                {ps.trendPct >= 0 ? "▲" : "▼"} {Math.abs(ps.trendPct)} %
              </span>
            )}
          </div>
        </div>
        <div className="adm-kpi"><div className="k">Interactions — {ps.label}</div><div className="v">{ps.events.toLocaleString("fr-FR")}</div></div>
        <div className="adm-kpi"><div className="k">Engagement</div><div className="v">{s.engagementPct} %</div></div>
        <div className="adm-kpi"><div className="k">Vues (depuis le début)</div><div className="v">{s.totalViews.toLocaleString("fr-FR")}</div></div>
      </div>

      {/* Évolution sur la période */}
      <div className="adm-card">
        <h2>Évolution — {ps.label}</h2>
        <div className="ck-bars2">
          {ps.series.map((pt, i) => (
            <div className="col" key={`${pt.label}-${i}`}>
              <div
                className={`bar${i === ps.series.length - 1 ? " on" : ""}`}
                style={{ height: `${(pt.views / maxSerie) * 100}%` }}
                title={`${pt.label} · ${pt.views} vues`}
              />
              <div className="lb">{pt.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-cols2">
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

        {/* Provenance des visiteurs */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>D&apos;où viennent vos visiteurs</h2>
          {s.topSources.length === 0 ? (
            <p className="muted">
              La mesure de provenance démarre avec cette mise à jour — les
              premières données apparaîtront dès les prochaines visites.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", marginTop: ".6rem" }}>
                {s.topSources.map((src) => (
                  <div key={src.name} style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: ".88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{src.name}</div>
                      <div style={{ height: 6, borderRadius: 99, background: "var(--o-soft)", marginTop: ".25rem" }}>
                        <div style={{ height: "100%", width: `${Math.max(5, src.pct)}%`, borderRadius: 99, background: "linear-gradient(90deg,#FBB040,var(--o2))" }} />
                      </div>
                    </div>
                    <b style={{ flex: "none" }}>{src.pct} %</b>
                  </div>
                ))}
              </div>
              {s.devices.length > 0 && (
                <p className="muted" style={{ fontSize: ".82rem", margin: "1rem 0 0" }}>
                  Appareils : {s.devices.map((d) => `${d.name} ${d.pct} %`).join(" · ")}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation des visiteurs — pleine largeur, sous les deux cartes */}
      <div className="adm-card">
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

      {/* Détail complet, replié par défaut */}
      <details className="adm-card" style={{ cursor: "pointer" }}>
        <summary style={{ fontWeight: 800, fontSize: "1rem" }}>Voir le détail complet (toutes les pages, jour par jour)</summary>
        <div className="adm-cols2" style={{ marginTop: "1rem", cursor: "auto" }}>
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
        <div className="adm-cols2" style={{ gap: "1rem", marginTop: "1rem", cursor: "auto" }}>
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
