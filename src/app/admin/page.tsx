import { parisToday } from "@/lib/dates";
import Link from "next/link";
import { Icon } from "./icons";
import { readAnalytics, lastDays } from "@/lib/analytics";
import { unreadCount } from "@/lib/newsletter";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { listItems } from "@/lib/editorial";
import { listPosts } from "@/lib/social-posts";
import { listApplications } from "@/lib/jobs";
import { unreadMessages } from "@/lib/contact-messages";
import { publicStatus } from "@/lib/social";
import { telegramConfigured } from "@/lib/notify";
import { mailerConfigured } from "@/lib/mailer";
import { isSet } from "@/lib/settings";
import { alfredAdvice, buildStatsSummary, alfredTrafficAnalysis, pageLabel, periodStats, type Periode } from "@/lib/stats-report";
import { urgentTaskCount, listOpenTasks } from "@/lib/tasks";
import { Suspense } from "react";

// Conseils d'Alfred (générés 1x/jour) — en Suspense pour ne jamais retarder
// l'affichage du reste du tableau de bord.
async function AlfredAdviceCard() {
  const tips = await alfredAdvice();
  return (
    <div className="adm-card" style={{ margin: 0, borderLeft: "4px solid var(--o)" }}>
      <h2>Les conseils d&apos;Alfred</h2>
      <p className="muted" style={{ fontSize: ".8rem", margin: ".2rem 0 .7rem", color: "var(--ink3)" }}>
        Pour votre visibilité, à partir des données du site (visites, provenance, comportement).
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: ".7rem" }}>
        {tips.map((t) => (
          <div key={t.text} style={{ display: "flex", alignItems: "center", gap: ".8rem", flexWrap: "wrap" }}>
            <span style={{ flex: "1 1 260px", fontSize: ".92rem", lineHeight: 1.55 }}>{t.text}</span>
            <Link
              className="adm-btn ghost sm"
              href={`/admin/communication?ask=${encodeURIComponent(t.prompt)}`}
              style={{ flex: "none" }}
            >
              Lancer avec Alfred →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Analyse d'audience d'Alfred (IA) — en Suspense, comme les conseils.
async function AlfredAnalysisCard() {
  const analysis = await alfredTrafficAnalysis();
  const tg = telegramConfigured();
  return (
    <div className="adm-card" style={{ borderLeft: "4px solid var(--o)" }}>
      <h2>L&apos;analyse d&apos;Alfred</h2>
      <p style={{ fontSize: ".95rem", lineHeight: 1.75, margin: ".4rem 0 .8rem" }}>{analysis}</p>
      <p className="muted" style={{ fontSize: ".8rem", color: "var(--ink3)", margin: 0 }}>
        {tg
          ? "Ce résumé vous est aussi envoyé chaque semaine sur Telegram."
          : "Activez Telegram dans les Réglages pour recevoir ce résumé chaque semaine."}
      </p>
    </div>
  );
}

const RANK_COLORS = ["#E8B33C", "#B9BDC7", "#C98A5A"];

const PERIODES: { id: Periode; label: string }[] = [
  { id: "jour", label: "Jour" },
  { id: "semaine", label: "Semaine" },
  { id: "mois", label: "Mois" },
  { id: "annee", label: "Année" },
];

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
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
  const days = lastDays(a, 30);
  const paths = Object.entries(a.paths).sort((x, y) => y[1] - x[1]);
  const events = Object.entries(a.events).sort((x, y) => y[1] - x[1]);
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";
  const gscOn = !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const maxEvent = Math.max(1, ...events.slice(0, 5).map(([, n]) => n));

  // Tout ce qui attend une action de John, en une seule liste.
  const appsTodo = listApplications().filter((x) => !x.refusedAt && !x.invitedAt && !x.read).length;
  const msgUnread = unreadMessages();
  const newSubs = unreadCount();
  const artDrafts = listItems().filter((i) => i.status === "brouillon").length;
  const social = listPosts();
  const postDrafts = social.filter((p) => p.status === "brouillon").length;
  const newsDrafts = listCampaigns().filter((c) => c.status === "brouillon").length;
  const today = parisToday();
  const nextPlanned = social
    .filter((p) => p.status === "planifie" && p.scheduledDate && p.scheduledDate >= today)
    .sort((x, y) => (x.scheduledDate! < y.scheduledDate! ? -1 : 1))[0];

  const TODO: { n: number; label: string; href: string; ic: string; urgent?: boolean }[] = [
    { n: urgentTaskCount(), label: "tâche(s) en retard ou du jour", href: "/admin/taches", ic: "check", urgent: true },
    { n: Math.max(0, listOpenTasks().length - urgentTaskCount()), label: "autre(s) tâche(s) ouverte(s)", href: "/admin/taches", ic: "check" },
    { n: appsTodo, label: "candidature(s) à traiter", href: "/admin/recrutement", ic: "users", urgent: true },
    { n: msgUnread, label: "message(s) reçu(s) non lu(s)", href: "/admin/messages", ic: "inbox", urgent: true },
    { n: newSubs, label: "nouvelle(s) inscription(s) newsletter", href: "/admin/communication/newsletter", ic: "bell" },
    { n: artDrafts, label: "brouillon(s) d'article à relire", href: "/admin/communication/calendrier", ic: "draft" },
    { n: postDrafts, label: "post(s) réseaux à valider", href: "/admin/communication/reseaux", ic: "megaphone" },
    { n: newsDrafts, label: "newsletter(s) en brouillon", href: "/admin/communication/newsletter", ic: "mail" },
  ].filter((t) => t.n > 0);

  // Connexions : on ne montre que ce qui pose problème.
  const accounts = publicStatus();
  const issues: { label: string; href: string }[] = [];
  if (!isSet("anthropicApiKey")) issues.push({ label: "Alfred (IA) — clé API manquante", href: "/admin/reglages" });
  if (!mailerConfigured()) issues.push({ label: "E-mails Microsoft 365 — à configurer", href: "/admin/reglages" });
  if (!telegramConfigured()) issues.push({ label: "Telegram — à configurer", href: "/admin/reglages" });
  if (!accounts.find((x) => x.id === "linkedin")?.connected) issues.push({ label: "LinkedIn — non connecté", href: "/admin/reglages" });

  return (
    <>
    <div className="ck-grid">
      <div className="ck-main">
        <div className="ck-hero">
          <div className="lbl">Cockpit Trevys</div>
          <h2>Bonjour John</h2>
          <Link className="cta" href="/admin/communication">Parler à Alfred →</Link>
        </div>

        {/* La seule liste qui compte : ce qui attend une action */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>À traiter</h2>
          {TODO.length === 0 ? (
            <p className="muted" style={{ margin: ".4rem 0 0" }}>Rien en attente — tout est à jour.</p>
          ) : (
            <div className="ck-todo">
              {TODO.map((t) => (
                <Link href={t.href} className={`ck-todo-it${t.urgent ? " urgent" : ""}`} key={t.label}>
                  <span className="ic"><Icon name={t.ic} /></span>
                  <span className="tx"><b>{t.n}</b> {t.label}</span>
                  <span className="go">→</span>
                </Link>
              ))}
            </div>
          )}
          {nextPlanned && (
            <p className="muted" style={{ fontSize: ".82rem", margin: "1rem 0 0" }}>
              Prochaine publication planifiée : {nextPlanned.scheduledDate} ({nextPlanned.network === "linkedin" ? "LinkedIn" : "Instagram"}).
            </p>
          )}
        </div>

        {/* Les conseils d'Alfred */}
        <Suspense
          fallback={
            <div className="adm-card" style={{ margin: 0, borderLeft: "4px solid var(--o)" }}>
              <h2>Les conseils d&apos;Alfred</h2>
              <p className="muted" style={{ margin: ".4rem 0 0" }}>
                <span className="adm-spin" style={{ borderColor: "var(--o-soft)", borderTopColor: "var(--o)" }} /> Alfred analyse vos données…
              </p>
            </div>
          }
        >
          <AlfredAdviceCard />
        </Suspense>

      </div>

      <div className="ck-aside">
        <div className="ck-acard">
          <h3>Actions rapides</h3>
          <div className="ck-ql">
            <Link href="/admin/communication"><span className="qi"><Icon name="chat" /></span> Parler à Alfred</Link>
            <Link href="/admin/articles/new"><span className="qi"><Icon name="pen" /></span> Nouvel article</Link>
            <Link href="/admin/communication/reseaux"><span className="qi"><Icon name="megaphone" /></span> Réseaux sociaux</Link>
            <Link href="/admin/communication/newsletter"><span className="qi"><Icon name="mail" /></span> Préparer un mailing</Link>
            <Link href="/admin/taches"><span className="qi"><Icon name="check" /></span> Mes tâches</Link>
            <a href="#audience"><span className="qi"><Icon name="chart" /></span> Audience du site</a>
            <Link href="/"><span className="qi"><Icon name="globe" /></span> Voir le site</Link>
          </div>
        </div>

        <div className="ck-acard">
          <h3>Connexions</h3>
          {issues.length === 0 ? (
            <p className="muted" style={{ fontSize: ".86rem", margin: ".4rem 0 0" }}>Tout est connecté et opérationnel.</p>
          ) : (
            <div className="ck-conns">
              {issues.map((c) => (
                <Link href={c.href} className="ck-conn" key={c.label}>
                  <span className="dot ko" />
                  <span className="lb" style={{ fontWeight: 600 }}>{c.label}</span>
                </Link>
              ))}
            </div>
          )}
          <p className="muted" style={{ fontSize: ".78rem", margin: ".7rem 0 0" }}>
            <Link href="/admin/reglages" className="adm-link">Gérer les connexions →</Link>
          </p>
        </div>
      </div>
    </div>

    {/* Audience du site (ex-page Statistiques), pleine largeur */}
    <section id="audience" style={{ scrollMarginTop: "90px", marginTop: "1.6rem", minWidth: 0 }}>
      <div className="adm-h" style={{ marginBottom: ".8rem" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem" }}>Audience du site</h1>
          <p>{a.updatedAt && `Dernière mesure : ${new Date(a.updatedAt).toLocaleString("fr-FR")}.`}</p>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="adm-card" style={{ borderLeft: "4px solid var(--o)" }}>
            <h2>L&apos;analyse d&apos;Alfred</h2>
            <p className="muted" style={{ margin: ".4rem 0 0" }}>
              <span className="adm-spin" style={{ borderColor: "var(--o-soft)", borderTopColor: "var(--o)" }} /> Alfred analyse l&apos;audience…
            </p>
          </div>
        }
      >
        <AlfredAnalysisCard />
      </Suspense>
      {/* Période d'analyse */}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
        {PERIODES.map((pp) => (
          <Link
            key={pp.id}
            href={`/admin?periode=${pp.id}#audience`}
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
    </section>
    </>
  );
}
