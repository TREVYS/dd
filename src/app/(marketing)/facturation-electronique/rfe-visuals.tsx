// Visuels de la réforme — en HTML/CSS (propres, responsives, aux couleurs Trevys).

// Le nouveau circuit de la facture : Fournisseur → PA → PA → Client,
// et remontée des données vers le PPF puis l'administration fiscale.
export function RfeFlow() {
  return (
    <div className="mkt-circuit">
      <div className="mkt-circuit-row">
        <div className="mkt-cnode">
          <span className="ic">📤</span>
          <b>Fournisseur</b>
          <small>émet la facture</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode hot">
          <span className="ic">🛡️</span>
          <b>Plateforme agréée</b>
          <small>PA émettrice</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode hot">
          <span className="ic">🛡️</span>
          <b>Plateforme agréée</b>
          <small>PA réceptrice</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode">
          <span className="ic">📥</span>
          <b>Client</b>
          <small>reçoit la facture</small>
        </div>
      </div>

      <div className="mkt-circuit-data">
        <div className="mkt-circuit-updown" aria-hidden="true" />
        <div className="mkt-cnode dark">
          <b>PPF · Portail Public de Facturation</b>
          <small>annuaire des entreprises &amp; concentrateur des données → administration fiscale</small>
        </div>
      </div>
    </div>
  );
}
