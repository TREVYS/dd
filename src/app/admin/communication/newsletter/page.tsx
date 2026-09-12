import Link from "next/link";
import { PendingButton } from "../../pending-button";
import { listSubscribers, unreadCount, listUnsubscribed, PROFILS } from "@/lib/newsletter";
import { listVideos } from "@/lib/videos";
import { telegramConfigured } from "@/lib/notify";
import { listCampaigns, articleSendHistory } from "@/lib/newsletter-campaigns";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { getAllPosts, getPost, formatDateFr } from "@/lib/blog";
import { markNewsletterReadAction, createCampaignAction, createArticlesCampaignAction, deleteSubscriberAction, sendOptinInvitesAction, importContactsAction, updateSubscriberAction } from "./actions";
import { campaignOpens, contactActivity } from "@/lib/newsletter-stats";
import { optinStats } from "@/lib/newsletter-optin";
import { ArticlePicker, type PickPost } from "./article-picker";
import { NewsletterTabs, type NlVue } from "./newsletter-tabs";
import { SubscribersTable, type SubRow } from "./subscribers-table";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin({
  searchParams,
}: {
  searchParams: Promise<{
    vue?: string; error?: string; optin?: string; n?: string; skipped?: string;
    imp?: string; a?: string; u?: string; s?: string;
  }>;
}) {
  const sp = await searchParams;
  const vue: NlVue =
    sp.vue === "preparation" || sp.vue === "suivi" ? sp.vue : "inscrits";

  const subs = listSubscribers();
  const unsubscribed = listUnsubscribed();
  const unread = unreadCount();
  const tg = telegramConfigured();
  const campaigns = listCampaigns();
  const mailOn = mailerConfigured();

  // Statistiques d'ouverture (pixel de suivi, par contact).
  const activity = contactActivity();
  const sentCamps = campaigns.filter((c) => c.status === "envoye" && (c.sentCount ?? 0) > 0);
  const drafts = campaigns.filter((c) => c.status === "brouillon");
  const withOpens = sentCamps.map((c) => ({ c, opens: campaignOpens(c.id) }));
  const totSent = withOpens.reduce((x, y) => x + (y.c.sentCount ?? 0), 0);
  const totOpens = withOpens.reduce((x, y) => x + y.opens, 0);
  const avgOpenRate = totSent > 0 ? Math.round((totOpens / totSent) * 100) : null;
  const ninety = Date.now() - 90 * 24 * 3600 * 1000;
  const isActive = (email: string) => {
    const a = activity[email.toLowerCase()];
    return !!(a?.lastOpen && new Date(a.lastOpen).getTime() > ninety);
  };
  const activeCount = subs.filter((x) => isActive(x.email)).length;
  const clientCount = subs.filter((x) => x.client === true).length;

  // Articles publiés (sélecteur de diffusion) + vidéos du site.
  const videos = listVideos();
  const { articleMetier } = await import("@/lib/metier");
  const mailHistory = articleSendHistory();
  const pickPosts: PickPost[] = getAllPosts().map((p) => {
    const content = getPost(p.slug)?.content ?? "";
    return {
      slug: p.slug,
      title: p.title,
      category: p.category,
      metier: articleMetier(p),
      dateLabel: formatDateFr(p.date),
      search: `${p.title} ${p.excerpt} ${content}`.toLowerCase(),
      mailSent: mailHistory[p.slug],
    };
  });

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Newsletter {unread > 0 && <span className="adm-soon" style={{ background: "#E26A0F", color: "#fff" }}>{unread} nouveau{unread > 1 ? "x" : ""}</span>}</h1>
          <p>
            {vue === "inscrits" && "Votre base de contacts : catégories, ancienneté et activité."}
            {vue === "preparation" && "Composez un mailing et choisissez précisément vos destinataires."}
            {vue === "suivi" && "Vos campagnes en cours et passées, avec leurs résultats."}
          </p>
        </div>
        {vue === "inscrits" && unread > 0 && (
          <form action={markNewsletterReadAction}>
            <button className="adm-btn ghost" type="submit">Tout marquer comme lu</button>
          </form>
        )}
      </div>

      <NewsletterTabs
        vue={vue}
        counts={{ inscrits: subs.length, preparation: drafts.length, suivi: sentCamps.length }}
      />

      {/* ===================== Onglet 1 : INSCRIPTIONS ===================== */}
      {vue === "inscrits" && (
        <>
          <div className="adm-grid">
            <div className="adm-kpi"><div className="k">Inscrits</div><div className="v o">{subs.length}</div></div>
            <div className="adm-kpi"><div className="k">Clients du cabinet</div><div className="v">{clientCount}</div></div>
            <div className="adm-kpi"><div className="k">Actifs (90 j)</div><div className="v">{activeCount}</div></div>
            <div className="adm-kpi"><div className="k">Désinscrits</div><div className="v">{unsubscribed.length}</div></div>
          </div>

          {sp.imp && (
            <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: sp.imp === "ok" ? "#bfe3c9" : "#f0d5d1", background: sp.imp === "ok" ? "#f1faf3" : "#fdf3f2" }}>
              {sp.imp === "ok"
                ? <>Import terminé : <b>{sp.a} ajouté(s)</b>, {sp.u} mis à jour, {sp.s} ignoré(s) (adresse invalide ou désinscrit).</>
                : sp.imp === "toobig"
                  ? "Fichier trop volumineux (4 Mo maximum)."
                  : "Aucun contact exploitable dans ce fichier — vérifiez qu'il contient une colonne d'adresses e-mail."}
            </div>
          )}

          <div className="adm-card">
            <h2>Vos inscrits</h2>
            <datalist id="nl-profils">
              {PROFILS.map((p) => <option key={p} value={p} />)}
            </datalist>
            <SubscribersTable
              rows={subs.map<SubRow>((s) => {
                const a = activity[s.email.toLowerCase()];
                return {
                  email: s.email,
                  name: s.name,
                  client: s.client,
                  profil: s.profil,
                  date: s.date,
                  read: s.read,
                  opens: a?.opens ?? 0,
                  lastOpen: a?.lastOpen,
                  active: isActive(s.email),
                };
              })}
              profils={PROFILS}
              updateAction={updateSubscriberAction}
              deleteAction={deleteSubscriberAction}
            />
          </div>

          {unsubscribed.length > 0 && (
            <div className="adm-card">
              <h2>Désinscrits ({unsubscribed.length})</h2>
              <p className="muted" style={{ fontSize: ".84rem", margin: "0 0 .7rem" }}>
                Ces adresses ne reçoivent plus rien et ne sont jamais réinvitées automatiquement.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {unsubscribed.map((u) => (
                  <span key={u.email} className="tp-chip" title={`Désinscrit le ${new Date(u.date).toLocaleDateString("fr-FR")}`}>
                    {u.email}<i>{new Date(u.date).toLocaleDateString("fr-FR")}</i>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="adm-card">
            <h2>Importer / exporter des contacts</h2>
            <p className="muted" style={{ fontSize: ".86rem", margin: "0 0 .8rem" }}>
              CSV ou export Excel — colonnes <code>email</code>, <code>nom</code>, <code>client</code> (oui/non),{" "}
              <code>profil</code>, dans n&apos;importe quel ordre. Les contacts existants sont mis à jour,
              les désinscrits ne sont jamais réimportés.
            </p>
            <form action={importContactsAction} style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
              <input type="file" name="file" accept=".csv,.txt,.tsv,text/csv,text/plain" required />
              <PendingButton pendingLabel="Import en cours…">Importer</PendingButton>
            </form>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".9rem" }}>
              <a className="adm-btn ghost sm" href="/admin/communication/newsletter/modele-contacts.csv" download>
                Télécharger le modèle CSV
              </a>
              {subs.length > 0 && (
                <a className="adm-btn ghost sm" href="/admin/communication/newsletter/export-contacts.csv" download>
                  Exporter mes {subs.length} contacts
                </a>
              )}
            </div>
            <p className="muted" style={{ fontSize: ".82rem", marginTop: ".6rem" }}>
              Astuce : exportez, complétez <code>client</code> et <code>profil</code> dans Excel, réimportez — tout est catégorisé d&apos;un coup.
            </p>
          </div>

          <div className="adm-card">
            <h2>Inviter une base de contacts (opt-in)</h2>
            <p className="muted" style={{ fontSize: ".86rem", margin: "0 0 .9rem" }}>
              Chaque contact reçoit une invitation avec deux boutons <b>Oui</b> / <b>Non merci</b>. Les « Oui »
              rejoignent vos abonnés ; les « Non » ne seront jamais réinvités. Déjà abonnés et déjà invités sont écartés.
            </p>
            {(() => { const st = optinStats(); return st.invited > 0 ? (
              <p className="muted" style={{ fontSize: ".8rem", margin: "0 0 .8rem" }}>
                {st.invited} invitation{st.invited > 1 ? "s" : ""} envoyée{st.invited > 1 ? "s" : ""} à ce jour · {st.declined} refus.
              </p>
            ) : null; })()}
            {sp.optin === "sent" && (
              <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
                {sp.n} invitation{Number(sp.n) > 1 ? "s" : ""} envoyée{Number(sp.n) > 1 ? "s" : ""}.
                {Number(sp.skipped) > 0 && ` ${sp.skipped} contact(s) écarté(s).`}
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
                <label>Adresses e-mail <small>(virgules, espaces ou retours à la ligne)</small></label>
                <textarea name="contacts" required style={{ minHeight: 100 }} placeholder={"jean@entreprise.fr\nmarie@societe.com"} />
              </div>
              <div className="adm-actions" style={{ marginTop: ".6rem" }}>
                <PendingButton pendingLabel="Envoi des invitations…">Envoyer les invitations</PendingButton>
              </div>
            </form>
          </div>

          <div
            className="adm-note"
            style={{ borderColor: tg ? "#bfe3c9" : "#f0e2cf", background: tg ? "#f1faf3" : "#fdf8f0" }}
          >
            {tg
              ? "Notifications Telegram actives — chaque nouvelle inscription vous est envoyée."
              : "Notifications Telegram non configurées (voir Réglages) pour être alerté à chaque inscription."}
          </div>
        </>
      )}

      {/* =================== Onglet 2 : PRÉPARATION ======================= */}
      {vue === "preparation" && (
        <>
          <div
            className="adm-note"
            style={{ marginBottom: "1.2rem", borderColor: mailOn ? "#bfe3c9" : "#f0e2cf", background: mailOn ? "#f1faf3" : "#fdf8f0" }}
          >
            {mailOn
              ? `Envoi actif — les mailings partent de ${senderAddress()}.`
              : "Envoi Microsoft 365 non configuré : renseignez la connexion Office 365 dans les Réglages."}
            {" "}
            <Link href="/admin/reglages" className="adm-link">Réglages →</Link>
          </div>

          {sp.error === "noselection" && (
            <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
              Sélectionnez au moins un article à diffuser.
            </div>
          )}

          {drafts.length > 0 && (
            <div className="adm-card">
              <h2>Mailings en préparation ({drafts.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {drafts.map((c) => (
                  <div key={c.id} className="nl-draftrow">
                    <span className="t">{c.subject}</span>
                    {c.sendAt && <span className="adm-tag">programmé le {c.sendAt}</span>}
                    <Link className="adm-btn sm" href={`/admin/communication/newsletter/${c.id}`}>
                      Relire, cibler &amp; envoyer
                    </Link>
                  </div>
                ))}
              </div>
              <p className="muted" style={{ fontSize: ".82rem", marginTop: ".7rem" }}>
                Le choix des destinataires (clients / non-clients, profil, recherche) se fait à l&apos;ouverture du mailing,
                juste avant l&apos;envoi.
              </p>
            </div>
          )}

          <div className="adm-card">
            <h2>Composer à partir d&apos;articles</h2>
            <p className="muted" style={{ fontSize: ".86rem", margin: "0 0 1rem" }}>
              Cochez les articles : le mailing est composé automatiquement (blocs par métier, vignettes,
              boutons « Lire l&apos;article »). Vous le relisez et choisissez vos destinataires avant l&apos;envoi.
            </p>
            <form action={createArticlesCampaignAction}>
              <ArticlePicker posts={pickPosts} />
              {videos.length > 0 && (
                <div className="adm-field" style={{ marginTop: "1rem", maxWidth: 520 }}>
                  <label>Joindre une vidéo <small>(optionnel — carte cliquable dans l&apos;e-mail)</small></label>
                  <select name="video" defaultValue="">
                    <option value="">Aucune vidéo</option>
                    {videos.map((v) => (
                      <option key={v.id} value={v.id}>{v.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="adm-field" style={{ marginTop: "1rem", maxWidth: 520 }}>
                <label>Objet de l&apos;e-mail <small>(optionnel — proposé par Alfred)</small></label>
                <input name="subject" placeholder="Ex. Nos dernières analyses — Trevys" />
              </div>
              <div className="adm-actions" style={{ marginTop: ".8rem" }}>
                <PendingButton pendingLabel="Alfred compose…">Composer le mailing</PendingButton>
              </div>
            </form>
          </div>

          <div className="adm-card">
            <h2>Créer un mailing libre — votre texte, ou un premier jet d&apos;Alfred</h2>
            <p className="muted" style={{ fontSize: ".86rem", margin: "0 0 .8rem" }}>
              Pour un message qui ne part pas d&apos;articles (vœux, invitation, annonce, profils disponibles…).
              Écrivez votre texte, ou briefez Alfred qui rédige le premier jet. Vous arrivez ensuite sur la page
              d&apos;édition : relecture avec l&apos;aide d&apos;Alfred, aperçu, <b>choix de la liste de diffusion</b> et envoi.
            </p>
            {sp.error === "alfred" && (
              <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
                Alfred n&apos;a pas pu rédiger le premier jet (voir sa configuration dans les Réglages). Vous pouvez
                créer le mailing avec votre propre texte.
              </div>
            )}
            <form action={createCampaignAction} className="adm-form">
              <div className="adm-field">
                <label>Objet de l&apos;e-mail <small>(optionnel — proposé par Alfred sinon)</small></label>
                <input name="subject" placeholder="Ex. Facturation électronique : ce qui change en 2026" />
              </div>
              <div className="adm-field">
                <label>Votre texte <small>(optionnel — Markdown : ## sous-titres, listes, liens)</small></label>
                <textarea name="body" style={{ minHeight: 120 }} placeholder={"Bonjour,\n\nVotre message…"} />
              </div>
              <div className="adm-field">
                <label>Ou confiez la rédaction à Alfred <small>(votre brief en une ou deux phrases — utilisé si le texte ci-dessus est vide)</small></label>
                <textarea name="brief" style={{ minHeight: 70 }} placeholder={"Ex. Annonce nos nouveaux locaux rue Le Nôtre, ton chaleureux, invite à passer nous voir."} />
              </div>
              <div className="adm-actions">
                <PendingButton pendingLabel="Création du mailing…">Créer et rédiger</PendingButton>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ====================== Onglet 3 : SUIVI ========================== */}
      {vue === "suivi" && (
        <>
          <div className="adm-grid">
            <div className="adm-kpi"><div className="k">Campagnes envoyées</div><div className="v o">{sentCamps.length}</div></div>
            <div className="adm-kpi"><div className="k">E-mails distribués</div><div className="v">{totSent}</div></div>
            <div className="adm-kpi">
              <div className="k">Taux d&apos;ouverture moyen</div>
              <div className="v">{avgOpenRate !== null ? `${avgOpenRate} %` : "—"}</div>
            </div>
            <div className="adm-kpi"><div className="k">En préparation</div><div className="v">{drafts.length}</div></div>
          </div>

          <div className="adm-card" style={{ padding: 0 }}>
            <table className="adm-table nl-camps">
              <thead>
                <tr>
                  <th style={{ paddingLeft: "1.1rem" }}>Objet</th>
                  <th>Statut</th><th>Envoi</th><th>Ouvertures</th><th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td data-l="Objet" style={{ fontWeight: 600, paddingLeft: "1.1rem" }}>
                      <Link href={`/admin/communication/newsletter/${c.id}`} className="adm-link">{c.subject}</Link>
                    </td>
                    <td data-l="Statut">
                      <span className={`adm-chipst ${c.status === "envoye" ? "pub" : "draft"}`}>
                        {c.status === "envoye" ? "Envoyé" : c.sendAt ? "Programmé" : "Brouillon"}
                      </span>
                    </td>
                    <td data-l="Envoi" className="muted">
                      {c.sentAt
                        ? `${c.sentCount ?? 0} dest. · ${new Date(c.sentAt).toLocaleDateString("fr-FR")}`
                        : c.sendAt ? `prévu le ${c.sendAt}` : "—"}
                    </td>
                    <td data-l="Ouvertures">
                      {c.status === "envoye" && (c.sentCount ?? 0) > 0
                        ? (() => { const o = campaignOpens(c.id); return <b>{o} <span className="muted" style={{ fontWeight: 500 }}>({Math.round((o / c.sentCount!) * 100)} %)</span></b>; })()
                        : <span className="muted">—</span>}
                    </td>
                    <td data-l="" style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                      <Link className="adm-btn ghost sm" href={`/admin/communication/newsletter/${c.id}`}>
                        {c.status === "envoye" ? "Analyse" : "Ouvrir"}
                      </Link>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={5} className="muted" style={{ padding: "1.2rem" }}>Aucune campagne pour l&apos;instant.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {sentCamps.length > 0 && (
            <p className="muted" style={{ fontSize: ".8rem", color: "var(--ink3)" }}>
              Ouvertures mesurées par pixel de suivi (certains clients mail préchargent les images :
              le taux est un ordre de grandeur). Ouvrez une campagne pour le détail par contact et par lien.
            </p>
          )}
        </>
      )}
    </>
  );
}
