import Link from "next/link";
import { getAllPosts, formatDateFr } from "@/lib/blog";
import { readAnalytics, lastDays } from "@/lib/analytics";
import { listSubscribers, unreadCount } from "@/lib/newsletter";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { listItems } from "@/lib/editorial";
import { listPosts } from "@/lib/social-posts";
import { listApplications } from "@/lib/jobs";
import { unreadMessages } from "@/lib/contact-messages";
import { publicStatus } from "@/lib/social";
import { telegramConfigured } from "@/lib/notify";
import { mailerConfigured } from "@/lib/mailer";
import { isSet } from "@/lib/settings";
import { listRoutines } from "@/lib/alfred-routines";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const posts = getAllPosts();
  const a = readAnalytics();
  const days = lastDays(a, 14);
  const max = Math.max(1, ...days.map((d) => d.views));
  const views14 = days.reduce((s, d) => s + d.views, 0);
  const recent = posts.slice(0, 3);
  const engagement = a.totals.views ? Math.min(100, Math.round((a.totals.events / a.totals.views) * 100)) : 0;

  // Pipeline de communication.
  const editorial = listItems();
  const artDrafts = editorial.filter((i) => i.status === "brouillon");
  const social = listPosts();
  const socialQueue = social.filter((p) => p.status === "brouillon");
  const socialPlanned = social.filter((p) => p.status === "planifie");
  const campaigns = listCampaigns();
  const newsDrafts = campaigns.filter((c) => c.status === "brouillon");

  // Activité entrante.
  const subs = listSubscribers();
  const newSubs = unreadCount();
  const apps = listApplications();
  const appsTodo = apps.filter((x) => !x.read && !x.refusedAt && !x.invitedAt).length;
  const msgUnread = unreadMessages();

  // Échéances à venir (posts planifiés, triés par date).
  const today = new Date().toISOString().slice(0, 10);
  const due = socialPlanned
    .filter((p) => p.scheduledDate && p.scheduledDate >= today)
    .sort((x, y) => (x.scheduledDate! < y.scheduledDate! ? -1 : 1))
    .slice(0, 5);

  // État des connexions.
  const accounts = publicStatus();
  const li = accounts.find((x) => x.id === "linkedin");
  const ig = accounts.find((x) => x.id === "instagram");
  const routinesOn = listRoutines().filter((r) => r.enabled).length;
  const conns: { label: string; ok: boolean; detail: string; href: string }[] = [
    { label: "Alfred (IA)", ok: isSet("anthropicApiKey"), detail: isSet("anthropicApiKey") ? `actif · ${routinesOn} routine${routinesOn > 1 ? "s" : ""}` : "clé API manquante", href: "/admin/reglages" },
    { label: "Microsoft 365", ok: mailerConfigured(), detail: mailerConfigured() ? "e-mails actifs" : "à configurer", href: "/admin/reglages" },
    { label: "Telegram", ok: telegramConfigured(), detail: telegramConfigured() ? "alertes actives" : "à configurer", href: "/admin/reglages" },
    { label: "LinkedIn", ok: !!li?.connected, detail: li?.connected ? li.accountName || "connecté" : "non connecté", href: "/admin/reglages" },
    { label: "Instagram", ok: !!ig?.connected, detail: ig?.connected ? ig.accountName || "connecté" : "non connecté", href: "/admin/reglages" },
  ];

  const R = 34, C = 2 * Math.PI * R;
  const dash = (engagement / 100) * C;

  const KPIS = [
    { k: "Vues (14 j)", v: views14.toLocaleString("fr-FR"), href: "/admin/statistiques", ic: "👁️" },
    { k: "Abonnés newsletter", v: subs.length.toLocaleString("fr-FR"), href: "/admin/communication/newsletter", ic: "💌" },
    { k: "Articles en ligne", v: String(posts.length), href: "/admin/articles", ic: "📰" },
    { k: "Posts en file", v: String(socialQueue.length + socialPlanned.length), href: "/admin/communication/reseaux", ic: "📣" },
    { k: "Candidatures à traiter", v: String(appsTodo), href: "/admin/recrutement", ic: "🧑‍💼" },
    { k: "Messages non lus", v: String(msgUnread), href: "/admin/messages", ic: "📬" },
  ];

  return (
    <div className="ck-grid">
      {/* Colonne principale */}
      <div className="ck-main">
        <div className="ck-hero">
          <div className="lbl">Cockpit Trevys</div>
          <h2>Bonjour John 👋 votre communication, pilotée d&apos;ici</h2>
          <Link className="cta" href="/admin/communication">Parler à Alfred →</Link>
        </div>

        {/* Alertes entrantes */}
        {(newSubs > 0 || appsTodo > 0 || msgUnread > 0) && (
          <div className="ck-alerts">
            {appsTodo > 0 && (
              <Link href="/admin/recrutement" className="ck-notif">
                <span className="ck-notif-ic">🧑‍💼</span>
                <span><b>{appsTodo} candidature{appsTodo > 1 ? "s" : ""}</b> à traiter</span>
                <span className="ck-notif-go">Voir →</span>
              </Link>
            )}
            {msgUnread > 0 && (
              <Link href="/admin/messages" className="ck-notif">
                <span className="ck-notif-ic">📬</span>
                <span><b>{msgUnread} message{msgUnread > 1 ? "s" : ""}</b> non lu{msgUnread > 1 ? "s" : ""}</span>
                <span className="ck-notif-go">Voir →</span>
              </Link>
            )}
            {newSubs > 0 && (
              <Link href="/admin/communication/newsletter" className="ck-notif">
                <span className="ck-notif-ic">🔔</span>
                <span><b>{newSubs} nouvelle{newSubs > 1 ? "s" : ""} inscription{newSubs > 1 ? "s" : ""}</b> newsletter</span>
                <span className="ck-notif-go">Voir →</span>
              </Link>
            )}
          </div>
        )}

        {/* Indicateurs clés */}
        <div className="ck-kpis">
          {KPIS.map((s) => (
            <Link className="ck-kpi" href={s.href} key={s.k}>
              <span className="ic">{s.ic}</span>
              <span className="v">{s.v}</span>
              <span className="k">{s.k}</span>
            </Link>
          ))}
        </div>

        {/* Pipeline de communication */}
        <div className="adm-card" style={{ margin: 0 }}>
          <div className="ck-sec-h" style={{ marginBottom: ".9rem" }}>
            <h2>Pipeline de communication</h2>
          </div>
          <div className="ck-pipe">
            <Link href="/admin/communication/calendrier" className="ck-pipe-col">
              <span className="n">{artDrafts.length}</span>
              <span className="t">Brouillons d&apos;articles</span>
              <span className="d">{artDrafts[0]?.title ? `· ${artDrafts[0].title.slice(0, 42)}…` : "Alfred peut en rédiger"}</span>
            </Link>
            <Link href="/admin/communication/reseaux" className="ck-pipe-col">
              <span className="n">{socialQueue.length}</span>
              <span className="t">Posts à relire</span>
              <span className="d">{socialQueue.length ? "en attente de validation" : "file vide"}</span>
            </Link>
            <Link href="/admin/communication/reseaux" className="ck-pipe-col">
              <span className="n">{socialPlanned.length}</span>
              <span className="t">Posts planifiés</span>
              <span className="d">{due[0]?.scheduledDate ? `prochain : ${due[0].scheduledDate}` : "rien de prévu"}</span>
            </Link>
            <Link href="/admin/communication/newsletter" className="ck-pipe-col">
              <span className="n">{newsDrafts.length}</span>
              <span className="t">Newsletters en brouillon</span>
              <span className="d">{campaigns.find((c) => c.status === "envoye")?.sentAt ? `dernier envoi : ${new Date(campaigns.find((c) => c.status === "envoye")!.sentAt!).toLocaleDateString("fr-FR")}` : "aucun envoi encore"}</span>
            </Link>
          </div>
        </div>

        {/* Audience */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>Audience — 14 derniers jours <span className="muted" style={{ fontWeight: 500, fontSize: ".85rem" }}>({views14.toLocaleString("fr-FR")} vues)</span></h2>
          <div className="ck-bars2">
            {days.map((d, i) => (
              <div className="col" key={d.day}>
                <div className={`bar${i === days.length - 1 ? " on" : ""}`} style={{ height: `${(d.views / max) * 100}%` }} title={`${d.day} · ${d.views} vues`} />
                <div className="lb">{d.day.slice(8)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenus récents */}
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
      </div>

      {/* Colonne latérale */}
      <div className="ck-aside">
        <div className="ck-acard">
          <div className="ck-sec-h" style={{ marginBottom: ".8rem" }}><h3>Engagement</h3></div>
          <div className="ck-gaugewrap">
            <svg width="130" height="130" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={R} fill="none" stroke="var(--o-soft)" strokeWidth="8" />
              <circle cx="45" cy="45" r={R} fill="none" stroke="var(--o)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${dash} ${C}`} transform="rotate(-90 45 45)" />
              <text x="45" y="49" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--ink)">{engagement}%</text>
            </svg>
            <div className="sb">Part des visiteurs qui interagissent (clics, téléchargements, formulaires).</div>
          </div>
        </div>

        {/* État des connexions */}
        <div className="ck-acard">
          <h3>Connexions</h3>
          <div className="ck-conns">
            {conns.map((c) => (
              <Link href={c.href} className="ck-conn" key={c.label}>
                <span className={`dot ${c.ok ? "ok" : "ko"}`} />
                <span className="lb">{c.label}</span>
                <span className="dt">{c.detail}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Échéances */}
        <div className="ck-acard">
          <h3>À venir</h3>
          {due.length === 0 ? (
            <p className="muted" style={{ fontSize: ".86rem" }}>Aucune publication planifiée. Demandez à Alfred d&apos;en préparer !</p>
          ) : (
            <div className="ck-due">
              {due.map((p) => (
                <Link href="/admin/communication/reseaux" className="ck-due-it" key={p.id}>
                  <span className="dt">{p.scheduledDate!.slice(8, 10)}/{p.scheduledDate!.slice(5, 7)}</span>
                  <span className="tx">{p.network === "linkedin" ? "in" : "IG"} · {p.content.slice(0, 46)}…</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="ck-acard">
          <h3>Actions rapides</h3>
          <div className="ck-ql">
            <Link href="/admin/communication"><span className="qi">🎩</span> Parler à Alfred</Link>
            <Link href="/admin/articles/new"><span className="qi">✍️</span> Nouvel article</Link>
            <Link href="/admin/communication/reseaux"><span className="qi">📣</span> Réseaux sociaux</Link>
            <Link href="/admin/communication/newsletter"><span className="qi">💌</span> Préparer un mailing</Link>
            <Link href="/admin/communication/routines"><span className="qi">🔁</span> Routines d&apos;Alfred</Link>
            <Link href="/admin/statistiques"><span className="qi">📊</span> Statistiques</Link>
            <Link href="/"><span className="qi">🌐</span> Voir le site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
