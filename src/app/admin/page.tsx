import Link from "next/link";
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

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const a = readAnalytics();
  const days = lastDays(a, 14);
  const max = Math.max(1, ...days.map((d) => d.views));
  const views7 = days.slice(7).reduce((s, d) => s + d.views, 0);
  const views7Prev = days.slice(0, 7).reduce((s, d) => s + d.views, 0);
  const trend = views7Prev > 0 ? Math.round(((views7 - views7Prev) / views7Prev) * 100) : null;

  // Tout ce qui attend une action de John, en une seule liste.
  const appsTodo = listApplications().filter((x) => !x.refusedAt && !x.invitedAt && !x.read).length;
  const msgUnread = unreadMessages();
  const newSubs = unreadCount();
  const artDrafts = listItems().filter((i) => i.status === "brouillon").length;
  const social = listPosts();
  const postDrafts = social.filter((p) => p.status === "brouillon").length;
  const newsDrafts = listCampaigns().filter((c) => c.status === "brouillon").length;
  const today = new Date().toISOString().slice(0, 10);
  const nextPlanned = social
    .filter((p) => p.status === "planifie" && p.scheduledDate && p.scheduledDate >= today)
    .sort((x, y) => (x.scheduledDate! < y.scheduledDate! ? -1 : 1))[0];

  const TODO: { n: number; label: string; href: string; ic: string; urgent?: boolean }[] = [
    { n: appsTodo, label: "candidature(s) à traiter", href: "/admin/recrutement", ic: "🧑‍💼", urgent: true },
    { n: msgUnread, label: "message(s) reçu(s) non lu(s)", href: "/admin/messages", ic: "📬", urgent: true },
    { n: newSubs, label: "nouvelle(s) inscription(s) newsletter", href: "/admin/communication/newsletter", ic: "🔔" },
    { n: artDrafts, label: "brouillon(s) d'article à relire", href: "/admin/communication/calendrier", ic: "📝" },
    { n: postDrafts, label: "post(s) réseaux à valider", href: "/admin/communication/reseaux", ic: "📣" },
    { n: newsDrafts, label: "newsletter(s) en brouillon", href: "/admin/communication/newsletter", ic: "💌" },
  ].filter((t) => t.n > 0);

  // Connexions : on ne montre que ce qui pose problème.
  const accounts = publicStatus();
  const issues: { label: string; href: string }[] = [];
  if (!isSet("anthropicApiKey")) issues.push({ label: "Alfred (IA) — clé API manquante", href: "/admin/reglages" });
  if (!mailerConfigured()) issues.push({ label: "E-mails Microsoft 365 — à configurer", href: "/admin/reglages" });
  if (!telegramConfigured()) issues.push({ label: "Telegram — à configurer", href: "/admin/reglages" });
  if (!accounts.find((x) => x.id === "linkedin")?.connected) issues.push({ label: "LinkedIn — non connecté", href: "/admin/reglages" });

  return (
    <div className="ck-grid">
      <div className="ck-main">
        <div className="ck-hero">
          <div className="lbl">Cockpit Trevys</div>
          <h2>Bonjour John 👋</h2>
          <Link className="cta" href="/admin/communication">Parler à Alfred →</Link>
        </div>

        {/* La seule liste qui compte : ce qui attend une action */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>À traiter</h2>
          {TODO.length === 0 ? (
            <p className="muted" style={{ margin: ".4rem 0 0" }}>Rien en attente — tout est à jour ✨</p>
          ) : (
            <div className="ck-todo">
              {TODO.map((t) => (
                <Link href={t.href} className={`ck-todo-it${t.urgent ? " urgent" : ""}`} key={t.label}>
                  <span className="ic">{t.ic}</span>
                  <span className="tx"><b>{t.n}</b> {t.label}</span>
                  <span className="go">→</span>
                </Link>
              ))}
            </div>
          )}
          {nextPlanned && (
            <p className="muted" style={{ fontSize: ".82rem", margin: "1rem 0 0" }}>
              📅 Prochaine publication planifiée : {nextPlanned.scheduledDate} ({nextPlanned.network === "linkedin" ? "LinkedIn" : "Instagram"}).
            </p>
          )}
        </div>

        {/* Audience compacte */}
        <div className="adm-card" style={{ margin: 0 }}>
          <h2>
            Audience — 7 derniers jours : <span style={{ color: "var(--o)" }}>{views7.toLocaleString("fr-FR")} vues</span>
            {trend !== null && (
              <span style={{ fontSize: ".85rem", fontWeight: 700, marginLeft: ".5rem", color: trend >= 0 ? "#2E9E6B" : "#c0392b" }}>
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} %
              </span>
            )}
          </h2>
          <div className="ck-bars2">
            {days.map((d, i) => (
              <div className="col" key={d.day}>
                <div className={`bar${i === days.length - 1 ? " on" : ""}`} style={{ height: `${(d.views / max) * 100}%` }} title={`${d.day} · ${d.views} vues`} />
                <div className="lb">{d.day.slice(8)}</div>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: ".82rem", margin: ".8rem 0 0" }}>
            <Link href="/admin/statistiques" className="adm-link">Voir la synthèse et l&apos;analyse d&apos;Alfred →</Link>
          </p>
        </div>
      </div>

      <div className="ck-aside">
        <div className="ck-acard">
          <h3>Actions rapides</h3>
          <div className="ck-ql">
            <Link href="/admin/communication"><span className="qi">🎩</span> Parler à Alfred</Link>
            <Link href="/admin/articles/new"><span className="qi">✍️</span> Nouvel article</Link>
            <Link href="/admin/communication/reseaux"><span className="qi">📣</span> Réseaux sociaux</Link>
            <Link href="/admin/communication/newsletter"><span className="qi">💌</span> Préparer un mailing</Link>
            <Link href="/admin/statistiques"><span className="qi">📊</span> Statistiques</Link>
            <Link href="/"><span className="qi">🌐</span> Voir le site</Link>
          </div>
        </div>

        <div className="ck-acard">
          <h3>Connexions</h3>
          {issues.length === 0 ? (
            <p className="muted" style={{ fontSize: ".86rem", margin: ".4rem 0 0" }}>✅ Tout est connecté et opérationnel.</p>
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
  );
}
