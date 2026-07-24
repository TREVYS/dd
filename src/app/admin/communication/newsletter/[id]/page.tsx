import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, markdownToEmailHtml, wrapEmail } from "@/lib/newsletter-campaigns";
import { listSubscribers } from "@/lib/newsletter";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { MarkdownEditor } from "../../../markdown-editor";
import { SubjectField } from "../subject-field";
import { saveCampaignAction, deleteCampaignAction, sendTestAction, sendCampaignAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CampaignEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tested?: string; sent?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const c = getCampaign(id);
  if (!c) notFound();

  const subscribers = listSubscribers();
  const count = subscribers.length;
  const mailOn = mailerConfigured();
  const preview = wrapEmail(markdownToEmailHtml(c.body || "_(Votre message apparaîtra ici.)_"));
  const sent = c.status === "envoye";

  const errMsg: Record<string, string> = {
    notconfig: "Envoi impossible : la connexion Microsoft 365 n'est pas configurée (voir Réglages).",
    send: "L'envoi a échoué. Vérifiez la configuration Microsoft 365 et réessayez.",
    empty: "Aucun inscrit à qui envoyer pour l'instant.",
  };

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Mailing</h1>
          <p>{sent ? `Envoyé à ${c.sentCount ?? 0} inscrit(s).` : "Brouillon — rédigez, prévisualisez, testez, puis envoyez."}</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication/newsletter">← Newsletter</Link>
      </div>

      {sp.saved && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Modifications enregistrées.</div>}
      {sp.tested && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>E-mail de test envoyé.</div>}
      {sp.sent && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Mailing envoyé à {sp.sent} inscrit(s).</div>}
      {sp.error && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>{errMsg[sp.error] ?? "Une erreur est survenue."}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.2rem", alignItems: "start" }} className="ck-mail-grid">
        {/* Édition */}
        <div className="adm-card">
          <form action={saveCampaignAction} className="adm-form">
            <input type="hidden" name="id" value={c.id} />
            <SubjectField defaultValue={c.subject} />
            <div className="adm-field">
              <label>Message <small>— barre d&apos;outils pour la mise en forme. Pas besoin de code.</small></label>
              <MarkdownEditor name="body" defaultValue={c.body} placeholder={"Bonjour,\n\n## Un titre\n\nVotre message…"} />
            </div>
            <div className="adm-actions">
              <button className="adm-btn" type="submit">Enregistrer</button>
            </div>
          </form>
        </div>

        {/* Aperçu */}
        <div className="adm-card">
          <h2 style={{ marginTop: 0 }}>Aperçu</h2>
          <iframe
            title="Aperçu de l'e-mail"
            srcDoc={preview}
            style={{ width: "100%", height: 460, border: "1px solid var(--line)", borderRadius: 12, background: "#fff" }}
          />
        </div>
      </div>

      {/* Envoi */}
      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Envoyer</h2>

        {!mailOn && (
          <div className="adm-note" style={{ margin: ".2rem 0 1rem", borderColor: "#f0e2cf", background: "#fdf8f0" }}>
            <b>Pour pouvoir envoyer, connectez d&apos;abord Microsoft 365.</b> C&apos;est une configuration
            en une fois (adresse d&apos;envoi, tenant, client, secret) qui permet d&apos;expédier depuis{" "}
            {senderAddress()}. <Link href="/admin/reglages" className="adm-link">Ouvrir les Réglages →</Link>
          </div>
        )}

        {/* Test */}
        <form action={sendTestAction} className="adm-actions" style={{ gap: ".5rem", alignItems: "flex-end", marginBottom: "1.1rem" }}>
          <input type="hidden" name="id" value={c.id} />
          <div className="adm-field" style={{ margin: 0 }}>
            <label style={{ fontSize: ".78rem" }}>Envoi de test à une adresse</label>
            <input name="testEmail" type="email" placeholder={senderAddress()} style={{ minWidth: 240 }} />
          </div>
          <button className="adm-btn ghost" type="submit" disabled={!mailOn}>Envoyer un test</button>
        </form>

        {/* Envoi réel : inscrits et/ou liste collée */}
        <form action={sendCampaignAction}>
          <input type="hidden" name="id" value={c.id} />
          <label className="adm-diff-net" style={{ marginBottom: ".4rem" }}>
            <input type="checkbox" name="includeSubscribers" defaultChecked={count > 0} disabled={count === 0} />
            <b>Inclure les {count} inscrit(s) à la newsletter</b>
          </label>
          {count > 0 && (
            <details style={{ margin: "0 0 .9rem", fontSize: ".85rem" }}>
              <summary style={{ cursor: "pointer", color: "var(--o)", fontWeight: 600 }}>
                Voir les adresses des inscrits
              </summary>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: ".55rem" }}>
                {subscribers.map((s) => (
                  <span
                    key={s.email}
                    style={{
                      padding: ".25rem .65rem", borderRadius: 100, background: "#faf8f5",
                      border: "1px solid var(--line)", color: "var(--ink2)", fontSize: ".8rem",
                    }}
                  >
                    {s.email}
                  </span>
                ))}
              </div>
            </details>
          )}
          <div className="adm-field">
            <label>Destinataires (clients, contacts…) <small>— collez les adresses, séparées par des virgules, des points-virgules ou des retours à la ligne</small></label>
            <textarea name="recipients" style={{ minHeight: 90 }} placeholder="client1@exemple.fr, client2@exemple.fr…" />
          </div>
          <div className="adm-actions">
            <button className="adm-btn" type="submit" disabled={!mailOn}>Envoyer le mailing</button>
          </div>
          <p className="muted" style={{ marginTop: ".6rem", color: "var(--ink3)", fontSize: ".82rem" }}>
            Les destinataires sont mis en copie cachée (Cci) : ils ne se voient pas entre eux.
          </p>
        </form>

        {sent && (
          <p className="muted" style={{ marginTop: ".9rem", color: "#2E9E6B", fontWeight: 600 }}>
            Ce mailing a déjà été envoyé ({c.sentCount ?? 0} destinataire(s)). Un nouvel envoi le renverra.
          </p>
        )}
      </div>

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <form action={deleteCampaignAction}>
          <input type="hidden" name="id" value={c.id} />
          <button className="adm-btn danger sm" type="submit">Supprimer ce mailing</button>
        </form>
      </div>
    </>
  );
}
