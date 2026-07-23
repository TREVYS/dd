import Link from "next/link";
import { listSubscribers, unreadCount } from "@/lib/newsletter";
import { telegramConfigured } from "@/lib/notify";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { getAllPosts, formatDateFr } from "@/lib/blog";
import { markNewsletterReadAction, createCampaignAction, createArticlesCampaignAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewsletterAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const subs = listSubscribers();
  const unread = unreadCount();
  const tg = telegramConfigured();
  const campaigns = listCampaigns();
  const mailOn = mailerConfigured();
  const posts = getAllPosts().slice(0, 24);

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
          <div className="ck-artpick">
            {posts.map((p) => (
              <label key={p.slug} className="ck-artpick-item">
                <input type="checkbox" name="slugs" value={p.slug} />
                <span className="ck-artpick-body">
                  <span className="t">{p.title}</span>
                  <span className="m">
                    <span className="adm-tag">{p.category}</span> {formatDateFr(p.date)}
                  </span>
                </span>
              </label>
            ))}
            {posts.length === 0 && <p className="muted">Aucun article publié pour l&apos;instant.</p>}
          </div>
          <div className="adm-field" style={{ marginTop: "1rem", maxWidth: 520 }}>
            <label>Objet de l&apos;e-mail <small>(optionnel — proposé automatiquement)</small></label>
            <input name="subject" placeholder="Ex. Nos dernières analyses — Trevys" />
          </div>
          <div className="adm-actions" style={{ marginTop: ".8rem" }}>
            <button className="adm-btn" type="submit">Composer le mailing</button>
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

      {/* Campagnes */}
      <div className="adm-card" style={{ padding: 0, marginBottom: "1.2rem" }}>
        <table className="adm-table">
          <thead>
            <tr><th style={{ paddingLeft: "1.1rem" }}>Objet</th><th>Statut</th><th>Envoi</th><th></th></tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
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
                <td style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                  <Link className="adm-btn ghost sm" href={`/admin/communication/newsletter/${c.id}`}>Ouvrir</Link>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={4} className="muted" style={{ padding: "1.2rem" }}>Aucun mailing préparé pour l&apos;instant.</td></tr>
            )}
          </tbody>
        </table>
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
            <tr><th>E-mail</th><th>Origine</th><th style={{ textAlign: "right" }}>Date</th></tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.email} style={!s.read ? { fontWeight: 700 } : undefined}>
                <td>{!s.read && <span style={{ color: "#E26A0F", marginRight: ".4rem" }}>●</span>}{s.email}</td>
                <td className="muted">{s.source}</td>
                <td style={{ textAlign: "right" }}>{new Date(s.date).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td colSpan={3} className="muted">Aucune inscription pour l&apos;instant.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
