import { ReglagesTabs } from "../reglages-tabs";
import { changePasswordAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReglagesSecurite({
  searchParams,
}: {
  searchParams: Promise<{ pwd?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Réglages — Sécurité</h1>
          <p>Mot de passe et protection de l&apos;accès au cockpit.</p>
        </div>
      </div>

      <ReglagesTabs />

      <div className="adm-card">
        <h2>Mon mot de passe</h2>
        {sp.pwd === "ok" && <div className="adm-note" style={{ margin: ".6rem 0 1rem", borderColor: "#bfe3c9", background: "#f1faf3" }}>Mot de passe modifié. Il sera demandé à la prochaine connexion.</div>}
        {sp.pwd === "wrong" && <div className="adm-note" style={{ margin: ".6rem 0 1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>Mot de passe actuel incorrect.</div>}
        {sp.pwd === "short" && <div className="adm-note" style={{ margin: ".6rem 0 1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>Le nouveau mot de passe doit faire au moins 10 caractères.</div>}
        {sp.pwd === "mismatch" && <div className="adm-note" style={{ margin: ".6rem 0 1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>Les deux saisies du nouveau mot de passe ne correspondent pas.</div>}
        <p className="muted" style={{ color: "var(--ink3)", fontSize: ".86rem", margin: "0 0 1rem" }}>
          Changez régulièrement votre mot de passe — et remplacez impérativement tout mot de passe
          de démonstration. 10 caractères minimum.
        </p>
        <form action={changePasswordAction} className="adm-form" style={{ maxWidth: 460 }}>
          <div className="adm-field">
            <label>Mot de passe actuel</label>
            <input type="password" name="current" required autoComplete="current-password" />
          </div>
          <div className="adm-row2">
            <div className="adm-field">
              <label>Nouveau mot de passe</label>
              <input type="password" name="next" required minLength={10} autoComplete="new-password" />
            </div>
            <div className="adm-field">
              <label>Confirmer</label>
              <input type="password" name="confirm" required minLength={10} autoComplete="new-password" />
            </div>
          </div>
          <div className="adm-actions">
            <button className="adm-btn" type="submit">Changer le mot de passe</button>
          </div>
        </form>
      </div>

      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Protections actives</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: ".9rem", lineHeight: 1.9, color: "var(--ink2)" }}>
          <li>Session limitée à <b>7 jours</b> — mot de passe redemandé environ 4 fois par mois.</li>
          <li>Connexion réservée aux rôles <b>Administrateur</b> et <b>Associé</b>.</li>
          <li>Alerte Telegram à chaque <b>connexion réussie</b> et à chaque <b>tentative refusée</b>.</li>
          <li>Back-office exclu des moteurs de recherche et protégé par le proxy d&apos;authentification.</li>
          <li>CV des candidats stockés en <b>privé</b>, accessibles uniquement connecté.</li>
        </ul>
      </div>
    </>
  );
}
