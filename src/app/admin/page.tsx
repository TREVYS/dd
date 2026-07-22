import Link from "next/link";
import { getAllPosts, formatDateFr } from "@/lib/blog";
import { listPages } from "@/lib/content-admin";
import { readAnalytics, lastDays } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const posts = getAllPosts();
  const pages = listPages();
  const a = readAnalytics();
  const days = lastDays(a, 7);
  const max = Math.max(1, ...days.map((d) => d.views));
  const recent = posts.slice(0, 3);
  const engagement = a.totals.views ? Math.min(100, Math.round((a.totals.events / a.totals.views) * 100)) : 0;

  const R = 34, C = 2 * Math.PI * R;
  const dash = (engagement / 100) * C;

  return (
    <div className="ck-grid">
      {/* Colonne principale */}
      <div className="ck-main">
        <div className="ck-hero">
          <div className="lbl">Cockpit Trevys</div>
          <h2>Bonjour John 👋 pilotez votre site & votre communication</h2>
          <Link className="cta" href="/admin/communication">Parler à Alfred →</Link>
        </div>

        <div className="ck-stats">
          <div className="ck-stat">
            <span className="ic"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg></span>
            <div><div className="k">Vues du site</div><div className="v">{a.totals.views.toLocaleString("fr-FR")}</div></div>
          </div>
          <div className="ck-stat">
            <span className="ic"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg></span>
            <div><div className="k">Interactions</div><div className="v">{a.totals.events.toLocaleString("fr-FR")}</div></div>
          </div>
          <div className="ck-stat">
            <span className="ic"><svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10" /></svg></span>
            <div><div className="k">Articles</div><div className="v">{posts.length}</div></div>
          </div>
        </div>

        <div>
          <div className="ck-sec-h">
            <h2>Contenus récents</h2>
            <Link href="/admin/articles">Tout voir</Link>
          </div>
          <div className="ck-cards">
            {recent.map((p) => (
              <Link className="ck-cc" href={`/admin/articles/${p.slug}`} key={p.slug}>
                <div className="th">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image && <img src={p.image} alt="" />}
                </div>
                <div className="bd">
                  <div className="cat">{p.category}</div>
                  <div className="ti">{p.title}</div>
                  <div className="mt">{formatDateFr(p.date)}</div>
                </div>
              </Link>
            ))}
            {recent.length === 0 && <p className="muted">Aucun article pour l&apos;instant.</p>}
          </div>
        </div>

        <div className="adm-card" style={{ margin: 0 }}>
          <h2>Audience — 7 derniers jours</h2>
          <div className="ck-bars2">
            {days.map((d, i) => (
              <div className="col" key={d.day}>
                <div className={`bar${i === days.length - 1 ? " on" : ""}`} style={{ height: `${(d.views / max) * 100}%` }} title={`${d.day} · ${d.views} vues`} />
                <div className="lb">{d.day.slice(8)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne latérale */}
      <div className="ck-aside">
        <div className="ck-acard">
          <div className="ck-sec-h" style={{ marginBottom: ".8rem" }}><h3>Statistiques</h3></div>
          <div className="ck-gaugewrap">
            <svg width="130" height="130" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={R} fill="none" stroke="var(--o-soft)" strokeWidth="8" />
              <circle cx="45" cy="45" r={R} fill="none" stroke="var(--o)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${dash} ${C}`} transform="rotate(-90 45 45)" />
              <text x="45" y="49" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)">{engagement}%</text>
            </svg>
            <div className="nm">Bonjour John 🔥</div>
            <div className="sb">Taux d&apos;engagement des visiteurs sur votre site.</div>
          </div>
        </div>

        <div className="ck-acard">
          <h3>Pôle communication</h3>
          <div className="ck-ql">
            <Link href="/admin/communication"><span className="qi">🎩</span> Parler à Alfred</Link>
            <Link href="/admin/communication/calendrier"><span className="qi">📅</span> Calendrier éditorial</Link>
            <Link href="/admin/articles/new"><span className="qi">✍️</span> Nouvel article</Link>
            <Link href="/admin/medias"><span className="qi">🖼️</span> Médias</Link>
          </div>
        </div>

        <div className="ck-acard">
          <h3>Aperçu</h3>
          <div className="ck-ql">
            <Link href="/admin/statistiques"><span className="qi">📊</span> Statistiques détaillées</Link>
            <Link href="/admin/pages"><span className="qi">📄</span> {pages.length} page{pages.length > 1 ? "s" : ""} personnalisée{pages.length > 1 ? "s" : ""}</Link>
            <Link href="/"><span className="qi">🌐</span> Voir le site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
