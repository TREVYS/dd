import Link from "next/link";
import { listSubscribers, unreadCount } from "@/lib/newsletter";
import { telegramConfigured } from "@/lib/notify";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { markNewsletterReadAction, createCampaignAction } from "./actions";

export const dynamic = "force-dynamic";

export default function NewsletterAdmin() {
  const subs = listSubscribers();
  const unread = unreadCount();
  const tg = telegramConfigured();
  const campaigns = listCampaigns();
  const mailOn = mailerConfigured();

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

      {/* Nouveau mailing */}
      <div className="adm-card" style={{ marginBottom: "1.2rem" }}>
        <h2>Préparer un mailing</h2>
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
