import { parisToday } from "@/lib/dates";
import { EmailPreview } from "./email-preview";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign, markdownToEmailHtml, wrapEmail, unsubscribeUrl, lastSentInfo, SEND_COOLDOWN_DAYS } from "@/lib/newsletter-campaigns";
import { listSubscribers } from "@/lib/newsletter";
import { mailerConfigured, senderAddress } from "@/lib/mailer";
import { MarkdownEditor } from "../../../markdown-editor";
import { SubjectField } from "../subject-field";
import { ConfirmSubmit } from "../../../confirm-submit";
import { RecipientsField } from "../recipients-field";
import { saveCampaignAction, deleteCampaignAction, sendTestAction, sendCampaignAction, scheduleCampaignAction } from "../actions";
import { campaignReport } from "@/lib/newsletter-stats";

export const dynamic = "force-dynamic";

export default async function CampaignEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tested?: string; sent?: string; error?: string; planned?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const c = getCampaign(id);
  if (!c) notFound();

  const subscribers = listSubscribers();
  const count = subscribers.length;
  const mailOn = mailerConfigured();
  const preview = wrapEmail(markdownToEmailHtml(c.body || "_(Votre message apparaîtra ici.)_"), unsubscribeUrl("exemple@trevys.fr"));
  // Garde-fou anti-sur-sollicitation : dernier envoi < 15 jours → pop-up.
  const last = lastSentInfo(c.id);
  const guardMsg =
    last && last.days < SEND_COOLDOWN_DAYS
      ? `Attention : vous avez déjà envoyé un message à votre communauté il y a ${last.days === 0 ? "moins d'un jour" : `${last.days} jour${last.days > 1 ? "s" : ""}`} (« ${last.subject} »).\n\nÊtes-vous sûr de vouloir envoyer un nouveau mailing maintenant ? (Recommandation : espacer d'au moins ${SEND_COOLDOWN_DAYS} jours pour ne pas lasser vos contacts.)`
      : undefined;
  const sent = c.status === "envoye";
  const report = sent ? campaignReport(c.id) : null;
  const sentN = c.sentCount ?? 0;
  const openRate = report && sentN > 0 ? Math.round((report.opens.length / sentN) * 100) : 0;
  const clickRate = report && sentN > 0 ? Math.round((report.clickers / sentN) * 100) : 0;
  const pretty = (u: string) => u.replace(/^https?:\/\/(www\.)?trevys\.fr/, "") .replace(/^$/, "/") || u;

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
      {sp.planned === "1" && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Envoi programmé — il partira automatiquement à la date choisie (tous les abonnés), avec confirmation Telegram.</div>}
      {sp.planned === "0" && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0e2cf", background: "#fdf8f0" }}>Programmation annulée — le mailing reste en brouillon.</div>}
      {sp.tested && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>E-mail de test envoyé.</div>}
      {sp.sent && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Mailing envoyé à {sp.sent} inscrit(s).</div>}
      {sp.error && <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>{errMsg[sp.error] ?? "Une erreur est survenue."}</div>}

      {/* Analyse du mailing envoyé */}
      {sent && report && (
        <div className="adm-card" style={{ borderLeft: "4px solid var(--o)" }}>
          <h2>Analyse du mailing</h2>
          <div className="adm-grid" style={{ marginBottom: ".4rem" }}>
            <div className="adm-kpi"><div className="k">Envoyés</div><div className="v">{sentN}</div></div>
            <div className="adm-kpi"><div className="k">Ouvertures</div><div className="v o">{report.opens.length} <span style={{ fontSize: "1rem" }}>({openRate} %)</span></div></div>
            <div className="adm-kpi"><div className="k">Cliqueurs</div><div className="v">{report.clickers} <span style={{ fontSize: "1rem" }}>({clickRate} %)</span></div></div>
            <div className="adm-kpi"><div className="k">Clics totaux</div><div className="v">{report.totalClicks}</div></div>
          </div>

          {report.byUrl.length > 0 ? (
            <>
              <h3 style={{ margin: "1rem 0 .5rem", fontSize: ".95rem" }}>Pages cliquées</h3>
              <table className="adm-table">
                <thead><tr><th>Lien</th><th style={{ textAlign: "right" }}>Personnes</th><th style={{ textAlign: "right" }}>Clics</th></tr></thead>
                <tbody>
                  {report.byUrl.map((r) => (
                    <tr key={r.url}>
                      <td style={{ maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <a href={r.url} target="_blank" rel="noopener" className="adm-link">{pretty(r.url)}</a>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{r.uniques}</td>
                      <td style={{ textAlign: "right" }}>{r.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="muted" style={{ margin: ".6rem 0 0" }}>Aucun clic mesuré pour l&apos;instant.</p>
          )}

          <details style={{ marginTop: "1rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: ".9rem" }}>
              Qui a ouvert ({report.opens.length}) / cliqué ({report.clickers})
            </summary>
            <div className="adm-cols2" style={{ marginTop: ".8rem" }}>
              <div>
                <h4 style={{ margin: "0 0 .4rem", fontSize: ".85rem" }}>Ouvertures</h4>
                {report.opens.length === 0 ? <p className="muted">Aucune.</p> : (
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: ".85rem", lineHeight: 1.8 }}>
                    {report.opens.map((o) => (
                      <li key={o.email}>{o.email} <span className="muted">· {new Date(o.at).toLocaleString("fr-FR")}</span></li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 style={{ margin: "0 0 .4rem", fontSize: ".85rem" }}>Cliqueurs</h4>
                {report.byContact.length === 0 ? <p className="muted">Aucun.</p> : (
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: ".85rem", lineHeight: 1.8 }}>
                    {report.byContact.map((k) => (
                      <li key={k.email}>{k.email} <span className="muted">· {k.clicks} clic{k.clicks > 1 ? "s" : ""}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </details>
          <p className="muted" style={{ fontSize: ".76rem", color: "var(--ink3)", margin: ".9rem 0 0" }}>
            Ouvertures mesurées par pixel (ordre de grandeur — certains clients mail les bloquent ou les préchargent) ;
            les clics, eux, sont exacts. Un clic compte aussi comme une ouverture.
          </p>
        </div>
      )}

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
          <EmailPreview html={preview} live={!sent} />
        </div>
      </div>

      {/* Programmation */}
      {!sent && (
        <div className="adm-card" style={{ marginTop: "1.2rem" }}>
          <h2>Programmer l&apos;envoi</h2>
          <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: ".2rem 0 1rem" }}>
            Choisissez une date : le mailing partira automatiquement ce jour-là à <b>tous les abonnés</b>
            (avec suivi des ouvertures/clics et confirmation Telegram).
            {c.sendAt && <> Actuellement programmé pour le <b>{c.sendAt}</b>.</>}
          </p>
          <form action={scheduleCampaignAction} style={{ display: "flex", gap: ".6rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="hidden" name="id" value={c.id} />
            <input type="date" name="sendAt" defaultValue={c.sendAt ?? ""} min={parisToday()} />
            <button className="adm-btn ghost sm" type="submit">Programmer</button>
            {c.sendAt && (
              <button className="adm-btn danger sm" type="submit" name="sendAt" value="">Annuler la programmation</button>
            )}
          </form>
        </div>
      )}

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
          <RecipientsField subscribers={subscribers.map((s) => s.email)} />
          <div className="adm-actions">
            {mailOn
              ? <ConfirmSubmit message={guardMsg}>Envoyer le mailing</ConfirmSubmit>
              : <button className="adm-btn" type="submit" disabled>Envoyer le mailing</button>}
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
