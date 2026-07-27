import Link from "next/link";
import { PendingButton } from "../../pending-button";
import { listSubscribers, unreadCount } from "@/lib/newsletter";
import { listVideos } from "@/lib/videos";
import { telegramConfigured } from "@/lib/notify";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { getAllPosts, getPost, formatDateFr } from "@/lib/blog";
import { markNewsletterReadAction, createCampaignAction, createArticlesCampaignAction, deleteSubscriberAction, sendOptinInvitesAction } from "./actions";
import { campaignOpens, contactActivity } from "@/lib/newsletter-stats";
import { optinStats } from "@/lib/newsletter-optin";
import { ArticlePicker, type PickPost } from "./article-picker";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; optin?: string; n?: string; skipped?: string }>;
}) {
  const sp = await searchParams;
  const subs = listSubscribers();
  const unread = unreadCount();
  const tg = telegramConfigured();
  const campaigns = listCampaigns();
  const videos = listVideos();
  const mailOn = mailerConfigured();

  // Statistiques d'ouverture (pixel de suivi, par contact).
  const activity = contactActivity();
  const sentCamps = campaigns.filter((c) => c.status === "envoye" && (c.sentCount ?? 0) > 0);
  const withOpens = sentCamps.map((c) => ({ c, opens: campaignOpens(c.id) }));
  const totSent = withOpens.reduce((x, y) => x + (y.c.sentCount ?? 0), 0);
  const totOpens = withOpens.reduce((x, y) => x + y.opens, 0);
  const avgOpenRate = totSent > 0 ? Math.round((totOpens / totSent) * 100) : null;
  const last = withOpens[0]; // campagnes triées de la plus récente à la plus ancienne
  const lastRate = last && (last.c.sentCount ?? 0) > 0 ? Math.round((last.opens / last.c.sentCount!) * 100) : null;
  const ninety = Date.now() - 90 * 24 * 3600 * 1000;
  const activeCount = subs.filter((x) => {
    const a = activity[x.email.toLowerCase()];
    return a?.lastOpen && new Date(a.lastOpen).getTime() > ninety;
  }).length;
  // Inscrits : actifs d'abord, puis du plus récent au plus ancien ;
  // seuls les 10 premiers sont affichés, le reste est replié.
  const isActive = (email: string) => {
    const a = activity[email.toLowerCase()];
    return !!(a?.lastOpen && new Date(a.lastOpen).getTime() > ninety);
  };
  const sortedSubs = subs.slice().sort((x, y) => {
    const ax = isActive(x.email) ? 1 : 0;
    const ay = isActive(y.email) ? 1 : 0;
    if (ax !== ay) return ay - ax;
    return y.date.localeCompare(x.date);
  });
  const topSubs = sortedSubs.slice(0, 10);
  const restSubs = sortedSubs.slice(10);

  // Historique : les 3 dernières campagnes visibles, le reste replié.
  const recentCamps = campaigns.slice(0, 3);
  const olderCamps = campaigns.slice(3);
  // Tous les articles publiés, avec un index de recherche (titre + résumé +
  // contenu) pour filtrer par mots-clés dans le sélecteur ci-dessous.
  const pickPosts: PickPost[] = getAllPosts().map((p) => {
    const content = getPost(p.slug)?.content ?? "";
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      dateLabel: formatDateFr(p.date),
      search: `${p.title} ${p.excerpt} ${content}`.toLowerCase(),
    };
  });

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Newsletter {unread > 0 && <span className="adm-soon" style={{ background: "#E26A0F", color: "#fff" }}>{unread} nouveau{unread > 1 ? "x" : ""}</span>}</h1>
          <p>Préparez vos mailings et suivez vos inscrits. {subs.length} inscription{subs.length > 1 ? "s" : ""} au total.</p>
        </div>
        {unread > 0 && (
          <form action={markNewsletterReadAction}>
            <button className="adm-btn ghost" type="submit">Tout marquer comme lu</button>
          </form>
        )}
      </div>

      {/* Statut de l'envoi Microsoft 365 */}
      <div
        className="adm-note"
        style={{
          marginBottom: "1.2rem",
          borderColor: mailOn ? "#bfe3c9" : "#f0e2cf",
          background: mailOn ? "#f1faf3" : "#fdf8f0",
        }}
      >
        {mailOn
          ? `Envoi Microsoft 365 actif — les mailings partent de ${senderAddress()}.`
          : "Envoi Microsoft 365 non configuré. Renseignez la connexion Office 365 dans les Réglages pour envoyer depuis contact@trevys-advisory.fr."}
        {" "}
        <Link href="/admin/reglages" className="adm-link">Réglages →</Link>
      </div>

      {/* Indicateurs clés */}
      <div className="adm-grid">
        <div className="adm-kpi"><div className="k">Abonnés</div><div className="v o">{subs.length}</div></div>
        <div className="adm-kpi">
          <div className="k">Taux d&apos;ouverture moyen</div>
          <div className="v">{avgOpenRate !== null ? `${avgOpenRate} %` : "—"}</div>
        </div>
        <div className="adm-kpi">
          <div className="k">Dernière campagne</div>
          <div className="v">{lastRate !== null ? `${lastRate} %` : "—"}</div>
        </div>
        <div className="adm-kpi"><div className="k">Contacts actifs (90 j)</div><div className="v">{activeCount}</div></div>
      </div>
      {sentCamps.length > 0 && (
        <p className="muted" style={{ fontSize: ".78rem", color: "var(--ink3)", margin: "-.4rem 0 1.2rem" }}>
          Ouvertures mesurées par pixel depuis cette mise à jour (certains clients mail comme Apple Mail
          préchargent les images : le taux est un ordre de grandeur).
        </p>
      )}

      {sp.error === "noselection" && (
        <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          Sélectionnez au moins un article à diffuser.
        </div>
      )}

      {/* Diffuser des articles publiés */}
      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Diffuser des articles à vos clients</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: ".2rem 0 1rem" }}>
          Cochez les articles à pousser : le mailing est composé automatiquement (titres, résumés,
          boutons « Lire l&apos;article »). Vous le relisez, l&apos;ajustez, puis l&apos;envoyez.
        </p>
        <form action={createArticlesCampaignAction}>
          <ArticlePicker posts={pickPosts} />
          {videos.length > 0 && (
            <div className="adm-field" style={{ marginTop: "1rem", maxWidth: 520 }}>
              <label>Joindre une vidéo <small>(optionnel — miniature cliquable + bouton « ▶ Regarder » dans l&apos;e-mail)</small></label>
              <select name="video" defaultValue="">
                <option value="">Aucune vidéo</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="adm-field" style={{ marginTop: "1rem", maxWidth: 520 }}>
            <label>Objet de l&apos;e-mail <small>(optionnel — proposé automatiquement)</small></label>
            <input name="subject" placeholder="Ex. Nos dernières analyses — Trevys" />
          </div>
          <div className="adm-actions" style={{ marginTop: ".8rem" }}>
            <PendingButton pendingLabel="Alfred compose…">Composer le mailing</PendingButton>
          </div>
        </form>
      </div>

      {/* Invitation opt-in d'une base de contacts */}
      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Inviter une base de contacts (opt-in)</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: ".2rem 0 1rem" }}>
          Collez les e-mails de contacts rencontrés par vos équipes : chacun reçoit une invitation
          chaleureuse avec deux boutons <b>Oui</b> / <b>Non merci</b>. Les « Oui » rejoignent
          automatiquement vos abonnés ; les « Non » sont mémorisés et ne seront jamais réinvités.
          Les contacts déjà abonnés ou déjà invités sont écartés d&apos;office.
        </p>
        {(() => { const st = optinStats(); return st.invited > 0 ? (
          <p className="muted" style={{ fontSize: ".8rem", margin: "0 0 .8rem" }}>
            {st.invited} invitation{st.invited > 1 ? "s" : ""} envoyée{st.invited > 1 ? "s" : ""} à ce jour · {st.declined} refus.
          </p>
        ) : null; })()}
        {sp.optin === "sent" && (
          <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
            {sp.n} invitation{Number(sp.n) > 1 ? "s" : ""} envoyée{Number(sp.n) > 1 ? "s" : ""}.
            {Number(sp.skipped) > 0 && ` ${sp.skipped} contact(s) écarté(s) (déjà abonnés, déjà invités ou refus).`}
          </div>
        )}
        {sp.optin === "none" && (
          <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0e2cf", background: "#fdf8f0" }}>
            Aucun nouvel envoi : tous ces contacts sont déjà abonnés, déjà invités ou ont refusé.
          </div>
        )}
        {sp.optin === "empty" && (
          <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
            Aucune adresse e-mail valide trouvée.
          </div>
        )}
        {sp.optin === "notconfig" && (
          <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
            Configurez d&apos;abord l&apos;envoi Microsoft 365 dans les Réglages.
          </div>
        )}
        <form action={sendOptinInvitesAction}>
          <div className="adm-field">
            <label>Adresses e-mail <small>(séparées par des virgules, espaces ou retours à la ligne)</small></label>
            <textarea name="contacts" required style={{ minHeight: 110 }} placeholder={"jean@entreprise.fr\nmarie@societe.com"} />
          </div>
          <div className="adm-actions" style={{ marginTop: ".6rem" }}>
            <PendingButton pendingLabel="Envoi des invitations…">Envoyer les invitations</PendingButton>
          </div>
        </form>
      </div>

      {/* Nouveau mailing */}
      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Préparer un mailing libre</h2>
        <form action={createCampaignAction} className="adm-form" style={{ marginTop: ".6rem" }}>
          <div className="adm-field">
            <label>Objet de l&apos;e-mail</label>
            <input name="subject" required placeholder="Ex. Facturation électronique : ce qui change en 2026" />
          </div>
          <div className="adm-actions">
            <button className="adm-btn" type="submit">Créer et rédiger</button>
          </div>
        </form>
      </div>

      {/* Campagnes : les 3 dernières, le reste replié */}
      <div className="adm-card" style={{ padding: 0, marginBottom: "1.2rem" }}>
        <table className="adm-table">
          <thead>
            <tr><th style={{ paddingLeft: "1.1rem" }}>Objet</th><th>Statut</th><th>Envoi</th><th>Ouvertures</th><th></th></tr>
          </thead>
          <tbody>
            {recentCamps.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, paddingLeft: "1.1rem" }}>
                  <Link href={`/admin/communication/newsletter/${c.id}`} className="adm-link">{c.subject}</Link>
                </td>
                <td>
                  <span className={`adm-chipst ${c.status === "envoye" ? "pub" : "draft"}`}>
                    {c.status === "envoye" ? "Envoyé" : "Brouillon"}
                  </span>
                </td>
                <td className="muted">
                  {c.sentAt ? `${c.sentCount ?? 0} dest. · ${new Date(c.sentAt).toLocaleDateString("fr-FR")}` : "—"}
                </td>
                <td>
                  {c.status === "envoye" && (c.sentCount ?? 0) > 0
                    ? (() => { const o = campaignOpens(c.id); return <b>{o} <span className="muted" style={{ fontWeight: 500 }}>({Math.round((o / c.sentCount!) * 100)} %)</span></b>; })()
                    : <span className="muted">—</span>}
                </td>
                <td style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                  <Link className="adm-btn ghost sm" href={`/admin/communication/newsletter/${c.id}`}>Ouvrir</Link>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={5} className="muted" style={{ padding: "1.2rem" }}>Aucun mailing préparé pour l&apos;instant.</td></tr>
            )}
          </tbody>
        </table>
        {olderCamps.length > 0 && (
          <details style={{ padding: ".6rem 1.1rem 1rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: ".88rem", color: "var(--ink2)" }}>
              Voir les {olderCamps.length} campagne{olderCamps.length > 1 ? "s" : ""} plus ancienne{olderCamps.length > 1 ? "s" : ""}
            </summary>
            <table className="adm-table" style={{ marginTop: ".6rem" }}>
              <tbody>
                {olderCamps.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link href={`/admin/communication/newsletter/${c.id}`} className="adm-link">{c.subject}</Link>
                    </td>
                    <td className="muted">{c.sentAt ? `${c.sentCount ?? 0} dest. · ${new Date(c.sentAt).toLocaleDateString("fr-FR")}` : "brouillon"}</td>
                    <td>
                      {c.status === "envoye" && (c.sentCount ?? 0) > 0
                        ? (() => { const o = campaignOpens(c.id); return <>{o} ouv. ({Math.round((o / c.sentCount!) * 100)} %)</>; })()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>

      <div
        className="adm-note"
        style={{
          marginBottom: "1.2rem",
          borderColor: tg ? "#bfe3c9" : "#f0e2cf",
          background: tg ? "#f1faf3" : "#fdf8f0",
        }}
      >
        {tg
          ? "Notifications Telegram actives — chaque nouvelle inscription vous est envoyée."
          : "Notifications Telegram non configurées (voir Réglages) pour être alerté à chaque inscription."}
      </div>

      <div className="adm-card">
        <h2>Inscrits</h2>
        <table className="adm-table">
          <thead>
            <tr><th>E-mail</th><th>Origine</th><th>Date</th><th>Activité</th><th style={{ textAlign: "right" }}>Actions</th></tr>
          </thead>
          <tbody>
            {topSubs.map((s) => (
              <tr key={s.email} style={!s.read ? { fontWeight: 700 } : undefined}>
                <td>{!s.read && <span style={{ color: "#E26A0F", marginRight: ".4rem" }}>●</span>}{s.email}</td>
                <td className="muted">{s.source}</td>
                <td className="muted">{new Date(s.date).toLocaleString("fr-FR")}</td>
                <td>
                  {(() => {
                    const a = activity[s.email.toLowerCase()];
                    if (!a?.opens) return <span className="muted">—</span>;
                    const active = isActive(s.email);
                    return (
                      <span style={{ fontSize: ".82rem", fontWeight: 600, color: active ? "#2E9E6B" : "var(--ink3)" }}>
                        {active ? "● Actif" : "○ Inactif"} · {a.opens} ouv.
                        {a.lastOpen ? ` · ${new Date(a.lastOpen).toLocaleDateString("fr-FR")}` : ""}
                      </span>
                    );
                  })()}
                </td>
                <td style={{ textAlign: "right" }}>
                  <form action={deleteSubscriberAction}>
                    <input type="hidden" name="email" value={s.email} />
                    <button className="adm-btn danger sm" type="submit">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={5} className="muted">Aucune inscription pour l&apos;instant.</td></tr>}
          </tbody>
        </table>
        {restSubs.length > 0 && (
          <details style={{ marginTop: ".6rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: ".88rem", color: "var(--ink2)" }}>
              Voir les {restSubs.length} autre{restSubs.length > 1 ? "s" : ""} inscrit{restSubs.length > 1 ? "s" : ""}
            </summary>
            <table className="adm-table" style={{ marginTop: ".6rem" }}>
              <tbody>
                {restSubs.map((s) => (
                  <tr key={s.email}>
                    <td>{s.email}</td>
                    <td className="muted">{s.source}</td>
                    <td className="muted">{new Date(s.date).toLocaleDateString("fr-FR")}</td>
                    <td>
                      {(() => {
                        const a = activity[s.email.toLowerCase()];
                        if (!a?.opens) return <span className="muted">—</span>;
                        return <span className="muted" style={{ fontSize: ".82rem" }}>{a.opens} ouv.</span>;
                      })()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <form action={deleteSubscriberAction}>
                        <input type="hidden" name="email" value={s.email} />
                        <button className="adm-btn danger sm" type="submit">Supprimer</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </>
  );
}
