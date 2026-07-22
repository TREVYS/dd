import { listSubscribers, unreadCount } from "@/lib/newsletter";
import { telegramConfigured } from "@/lib/notify";
import { markNewsletterReadAction } from "./actions";

export const dynamic = "force-dynamic";

export default function NewsletterAdmin() {
  const subs = listSubscribers();
  const unread = unreadCount();
  const tg = telegramConfigured();

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Newsletter {unread > 0 && <span className="adm-soon" style={{ background: "#E26A0F", color: "#fff" }}>{unread} nouveau{unread > 1 ? "x" : ""}</span>}</h1>
          <p>Inscrits à « Recevez nos analyses ». {subs.length} inscription{subs.length > 1 ? "s" : ""} au total.</p>
        </div>
        {unread > 0 && (
          <form action={markNewsletterReadAction}>
            <button className="adm-btn ghost" type="submit">Tout marquer comme lu</button>
          </form>
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
          ? "🔔 Notifications Telegram actives — chaque nouvelle inscription vous est envoyée."
          : "🔔 Notifications Telegram non configurées. Ajoutez TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID sur l'instance (voir Réglages) pour recevoir une alerte à chaque inscription."}
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
