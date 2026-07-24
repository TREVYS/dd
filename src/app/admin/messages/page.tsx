import { listMessages } from "@/lib/contact-messages";
import { markMessageReadAction, deleteMessageAction } from "./actions";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  const messages = listMessages();
  const unread = messages.filter((m) => !m.read).length;

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Messages reçus {unread > 0 && <span className="adm-soon" style={{ background: "#E26A0F", color: "#fff" }}>{unread} nouveau{unread > 1 ? "x" : ""}</span>}</h1>
          <p>Les demandes envoyées depuis le formulaire de contact du site. {messages.length} au total.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
        {messages.map((m) => (
          <div key={m.id} className="adm-card" style={{ borderLeft: m.read ? undefined : "4px solid #F5811F" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ fontWeight: 800 }}>
                {!m.read && <span style={{ color: "#E26A0F", marginRight: ".4rem" }}>●</span>}
                {m.firstName} {m.lastName}
                <span className="muted" style={{ fontWeight: 500, marginLeft: ".6rem", fontSize: ".84rem" }}>
                  {new Date(m.date).toLocaleString("fr-FR")}
                </span>
              </div>
              <span className="adm-tag">{m.subject || "Sans sujet"}</span>
            </div>
            <div className="muted" style={{ fontSize: ".86rem", margin: ".35rem 0 .7rem" }}>
              <a href={`mailto:${m.email}`} className="adm-link">{m.email}</a>
              {m.phone && <> · {m.phone}</>}
            </div>
            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--ink2)", lineHeight: 1.6 }}>{m.message}</p>
            <div className="adm-actions" style={{ marginTop: ".9rem" }}>
              <a className="adm-btn sm" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "votre message"} — Trevys`)}`}>
                Répondre par e-mail
              </a>
              {!m.read && (
                <form action={markMessageReadAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="adm-btn ghost sm" type="submit">Marquer comme lu</button>
                </form>
              )}
              <form action={deleteMessageAction}>
                <input type="hidden" name="id" value={m.id} />
                <button className="adm-btn danger sm" type="submit">Supprimer</button>
              </form>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="adm-card"><p className="muted" style={{ margin: 0 }}>Aucun message pour l&apos;instant.</p></div>
        )}
      </div>
    </>
  );
}
