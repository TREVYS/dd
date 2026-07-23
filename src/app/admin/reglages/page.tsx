import { publicStatus, PROVIDERS } from "@/lib/social";
import { isSet, settingsStatus } from "@/lib/settings";
import { mailerConfigured } from "@/lib/mailer";
import { disconnectSocialAction, saveSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

// Champs éditables de « Clés & connexions », groupés par service.
const CFG_GROUPS = [
  { title: "Alfred — Intelligence artificielle (Anthropic)", fields: [
    { k: "anthropicApiKey", label: "Clé API Anthropic", ph: "sk-ant-…", secret: true },
  ] },
  { title: "Notifications Telegram", fields: [
    { k: "telegramBotToken", label: "Jeton du bot", ph: "123456:ABC…", secret: true },
    { k: "telegramChatId", label: "Chat ID", ph: "votre identifiant", secret: false },
  ] },
  { title: "Newsletter (Brevo)", fields: [
    { k: "brevoApiKey", label: "Clé API Brevo", ph: "xkeysib-…", secret: true },
    { k: "brevoListId", label: "ID de liste", ph: "ex. 3", secret: false },
  ] },
  { title: "E-mailing Microsoft 365 (Office 365)", fields: [
    { k: "msSender", label: "Adresse d'envoi", ph: "contact@trevys-advisory.fr", secret: false },
    { k: "msTenantId", label: "Tenant ID (Directory)", ph: "xxxxxxxx-xxxx-…", secret: false },
    { k: "msClientId", label: "Client ID (Application)", ph: "xxxxxxxx-xxxx-…", secret: false },
    { k: "msClientSecret", label: "Client Secret", ph: "", secret: true },
  ] },
  { title: "Prise de rendez-vous (Calendly)", fields: [
    { k: "calendlyUrl", label: "URL Calendly", ph: "https://calendly.com/…", secret: false },
  ] },
  { title: "LinkedIn (app développeur)", fields: [
    { k: "linkedinClientId", label: "Client ID", ph: "", secret: false },
    { k: "linkedinClientSecret", label: "Client Secret", ph: "", secret: true },
  ] },
  { title: "Instagram / Meta (app développeur)", fields: [
    { k: "instagramClientId", label: "Client ID", ph: "", secret: false },
    { k: "instagramClientSecret", label: "Client Secret", ph: "", secret: true },
  ] },
] as const;

export default async function AdminReglages({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; connected?: string; error?: string; saved?: string }>;
}) {
  const sp = await searchParams;
  const accounts = publicStatus();
  const alfredKey = isSet("anthropicApiKey");
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";
  const tgOn = isSet("telegramBotToken") && isSet("telegramChatId");
  const mailOn = mailerConfigured();
  const status = Object.fromEntries(settingsStatus().map((s) => [s.key, s]));

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Réglages</h1>
          <p>Comptes réseaux sociaux, intégrations et paramètres du cabinet.</p>
        </div>
      </div>

      {sp.connected && (
        <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          ✅ Compte <b>{sp.connected}</b> connecté avec succès.
        </div>
      )}
      {sp.error && (
        <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          ⚠️ La connexion a échoué. Réessayez, ou vérifiez la configuration développeur.
        </div>
      )}

      {sp.saved && (
        <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>
          ✅ Réglages enregistrés.
        </div>
      )}

      <div className="adm-card">
        <h2>Clés &amp; connexions</h2>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 1.2rem" }}>
          Configurez ici vos clés API et connexions — elles prennent effet immédiatement, sans redéploiement.
          Les champs laissés vides ne modifient pas une valeur déjà enregistrée. Les secrets ne sont jamais réaffichés.
        </p>
        <form action={saveSettingsAction}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "1.4rem" }}>
            {CFG_GROUPS.map((g) => (
              <div key={g.title} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem" }}>
                <div style={{ fontWeight: 800, fontSize: ".92rem", marginBottom: ".8rem" }}>{g.title}</div>
                {g.fields.map((f) => {
                  const st = status[f.k];
                  return (
                    <div className="adm-field" key={f.k} style={{ marginBottom: ".8rem" }}>
                      <label>
                        {f.label}{" "}
                        {st?.set
                          ? <span style={{ color: "#2E9E6B", fontWeight: 700, fontSize: ".72rem" }}>● défini</span>
                          : <span style={{ color: "#C2410C", fontWeight: 700, fontSize: ".72rem" }}>● non défini</span>}
                      </label>
                      <input
                        name={f.k}
                        type={f.secret ? "password" : "text"}
                        placeholder={f.secret ? (st?.set ? "•••••• (laisser vide pour conserver)" : f.ph) : (st?.display || f.ph)}
                        autoComplete="off"
                        style={{ fontSize: ".85rem" }}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="adm-actions" style={{ marginTop: "1.4rem" }}>
            <button className="adm-btn" type="submit">Enregistrer les réglages</button>
          </div>
        </form>
      </div>

      <div className="adm-card">
        <h2>Alfred — clé API (Intelligence artificielle)</h2>
        <div
          style={{
            display: "flex", alignItems: "center", gap: ".7rem", margin: ".2rem 0 1rem",
            fontWeight: 700, color: alfredKey ? "#2E9E6B" : "#C2410C",
          }}
        >
          <span
            style={{
              width: 10, height: 10, borderRadius: "50%",
              background: alfredKey ? "#2E9E6B" : "#E26A0F",
            }}
          />
          {alfredKey ? "Alfred est actif — clé API détectée." : "Alfred est en veille — aucune clé API détectée."}
        </div>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".88rem", lineHeight: 1.6, margin: "0 0 .6rem" }}>
          Alfred utilise l&apos;IA Claude (Anthropic). Pour l&apos;activer, ajoutez votre clé
          <code> ANTHROPIC_API_KEY </code> sur l&apos;instance Gandi (elle n&apos;est jamais stockée dans le code) :
        </p>
        <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: ".88rem", lineHeight: 1.7, color: "var(--ink2)" }}>
          <li>Créez une clé sur <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a> (rubrique <b>API Keys</b>).</li>
          <li>Ouvrez la <b>console SSH</b> de votre instance Gandi (<code>hosting-user@…</code>).</li>
          <li>
            Ajoutez la ligne au fichier d&apos;environnement, puis redémarrez :
            <pre style={{ background: "#faf8f5", border: "1px solid var(--line)", borderRadius: 8, padding: ".7rem .9rem", overflowX: "auto", margin: ".4rem 0 0", fontSize: ".82rem" }}>
{`echo 'ANTHROPIC_API_KEY=sk-ant-…' >> ~/.env.trevys`}</pre>
          </li>
          <li>Redéployez (ou redémarrez l&apos;instance) pour qu&apos;Alfred prenne la clé en compte.</li>
        </ol>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".8rem", marginTop: ".8rem" }}>
          ⚠️ Ne collez jamais votre clé dans le chat ni dans un fichier versionné (Git).
        </p>
      </div>

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Notifications Telegram</h2>
        <div
          style={{
            display: "flex", alignItems: "center", gap: ".7rem", margin: ".2rem 0 1rem",
            fontWeight: 700, color: tgOn ? "#2E9E6B" : "#C2410C",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: tgOn ? "#2E9E6B" : "#E26A0F" }} />
          {tgOn ? "Actives — vous recevez une alerte à chaque inscription newsletter." : "Non configurées."}
        </div>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".88rem", lineHeight: 1.6, margin: "0 0 .6rem" }}>
          Recevez une notification sur Telegram dès qu&apos;un visiteur s&apos;inscrit à « Recevez nos analyses ».
        </p>
        <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: ".88rem", lineHeight: 1.7, color: "var(--ink2)" }}>
          <li>Sur Telegram, écrivez à <b>@BotFather</b> → <code>/newbot</code> → suivez les étapes → vous obtenez un <b>jeton de bot</b>.</li>
          <li>Démarrez une conversation avec votre bot (envoyez-lui « Bonjour »).</li>
          <li>Récupérez votre <b>chat id</b> : écrivez à <b>@userinfobot</b>, il vous le donne.</li>
          <li>
            Ajoutez les deux variables sur l&apos;instance (console SSH), puis redéployez :
            <pre style={{ background: "#faf8f5", border: "1px solid var(--line)", borderRadius: 8, padding: ".7rem .9rem", overflowX: "auto", margin: ".4rem 0 0", fontSize: ".82rem" }}>
{`echo 'TELEGRAM_BOT_TOKEN=123456:ABC…' >> ~/.env.trevys
echo 'TELEGRAM_CHAT_ID=votre_chat_id' >> ~/.env.trevys`}</pre>
          </li>
        </ol>
      </div>

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>E-mailing depuis Microsoft 365 (contact@trevys-advisory.fr)</h2>
        <div
          style={{
            display: "flex", alignItems: "center", gap: ".7rem", margin: ".2rem 0 1rem",
            fontWeight: 700, color: mailOn ? "#2E9E6B" : "#C2410C",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: mailOn ? "#2E9E6B" : "#E26A0F" }} />
          {mailOn ? "Actif — vous pouvez envoyer vos mailings depuis l'adresse du cabinet." : "Non configuré."}
        </div>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".88rem", lineHeight: 1.6, margin: "0 0 .6rem" }}>
          Les mailings partent directement de votre boîte Microsoft 365, via Microsoft Graph
          (aucun mot de passe SMTP à stocker). Configuration en une fois par un administrateur du tenant :
        </p>
        <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: ".88rem", lineHeight: 1.7, color: "var(--ink2)" }}>
          <li>Dans <a href="https://entra.microsoft.com" target="_blank" rel="noopener">Microsoft Entra ID</a> → <b>App registrations</b> → <b>New registration</b> (ex. « Trevys Mailing »).</li>
          <li>Notez le <b>Application (client) ID</b> et le <b>Directory (tenant) ID</b>.</li>
          <li><b>Certificates &amp; secrets</b> → <b>New client secret</b> → copiez la <b>valeur</b> (visible une seule fois).</li>
          <li><b>API permissions</b> → <b>Add a permission</b> → Microsoft Graph → <b>Application permissions</b> → <code>Mail.Send</code> → puis <b>Grant admin consent</b>.</li>
          <li>Renseignez ci-dessus l&apos;adresse d&apos;envoi, le tenant, le client ID et le secret. C&apos;est prêt.</li>
        </ol>
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".8rem", marginTop: ".8rem" }}>
          Astuce sécurité : pour limiter l&apos;envoi à la seule boîte du cabinet, un administrateur peut ajouter
          une <i>Application Access Policy</i> Exchange restreignant l&apos;app à <code>contact@trevys-advisory.fr</code>.
        </p>
      </div>

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Comptes réseaux sociaux</h2>
        <p className="muted" style={{ margin: "0 0 1.2rem", color: "var(--ink3)", fontSize: ".88rem" }}>
          Connectez vos comptes pour publier depuis le Pôle communication (à venir).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {accounts.map((a) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                border: "1px solid var(--line)",
                borderRadius: "14px",
                padding: "1rem 1.2rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: a.id === "linkedin" ? "#0A66C2" : "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  flex: "0 0 auto",
                }}
              >
                {a.id === "linkedin" ? "in" : "IG"}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 700 }}>{a.label}</div>
                <div style={{ fontSize: ".82rem", color: a.connected ? "#2E9E6B" : "var(--ink3)" }}>
                  {a.connected ? `Connecté${a.accountName ? " · " + a.accountName : ""}` : "Non connecté"}
                </div>
              </div>
              {a.connected ? (
                <form action={disconnectSocialAction}>
                  <input type="hidden" name="provider" value={a.id} />
                  <button className="adm-btn danger sm" type="submit">Déconnecter</button>
                </form>
              ) : (
                <a className="adm-btn sm" href={`/api/admin/social/${a.id}/start`}>
                  Connecter
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guide de configuration développeur si demandé ou non configuré */}
      {(sp.setup || accounts.some((a) => !a.configured)) && (
        <div className="adm-note" style={{ marginTop: "1.2rem", lineHeight: 1.6 }}>
          <b>Activer la connexion (une fois) :</b> chaque réseau nécessite une « application développeur »
          pour autoriser la publication.
          <ol style={{ margin: ".6rem 0 0", paddingLeft: "1.2rem" }}>
            <li>
              <b>LinkedIn</b> — créez une app sur{" "}
              <a href={PROVIDERS[0].docUrl} target="_blank" rel="noopener">linkedin.com/developers</a>, ajoutez
              l&apos;URL de redirection <code>https://www.trevys.fr/api/admin/social/linkedin/callback</code>,
              puis renseignez <code>LINKEDIN_CLIENT_ID</code> et <code>LINKEDIN_CLIENT_SECRET</code>.
            </li>
            <li>
              <b>Instagram</b> — créez une app Meta sur{" "}
              <a href={PROVIDERS[1].docUrl} target="_blank" rel="noopener">developers.facebook.com</a> (Instagram
              Graph + compte professionnel), redirection{" "}
              <code>https://www.trevys.fr/api/admin/social/instagram/callback</code>, puis{" "}
              <code>INSTAGRAM_CLIENT_ID</code> / <code>INSTAGRAM_CLIENT_SECRET</code>.
            </li>
          </ol>
          Donnez-moi les identifiants (ou dites-moi quand les apps sont créées) et je finalise la connexion.
        </div>
      )}

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Intégrations</h2>
        <table className="adm-table">
          <tbody>
            <tr><td style={{ fontWeight: 700 }}>Newsletter (Brevo)</td><td className="muted">Configurable via variables d&apos;environnement</td></tr>
            <tr><td style={{ fontWeight: 700 }}>E-mails de contact (SMTP)</td><td className="muted">Configurable via variables d&apos;environnement</td></tr>
            <tr><td style={{ fontWeight: 700 }}>Prise de rendez-vous (Calendly)</td><td className="muted">NEXT_PUBLIC_CALENDLY_URL</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
