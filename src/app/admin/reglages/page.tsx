import { publicStatus, PROVIDERS } from "@/lib/social";
import { disconnectSocialAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminReglages({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; connected?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const accounts = publicStatus();

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

      <div className="adm-card">
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
