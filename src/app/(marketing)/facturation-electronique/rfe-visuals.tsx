// Visuels de la réforme de la facturation électronique (schémas SVG autonomes,
// aux couleurs Trevys — aucune image externe).

// Schéma de fonctionnement : Fournisseur → PA → PPF (annuaire/concentrateur)
// → PA → Client, et remontée des données à l'administration fiscale.
export function RfeFlow() {
  return (
    <div className="mkt-flow" role="img" aria-label="Schéma : les factures transitent par les plateformes agréées (PA) et le Portail Public de Facturation concentre les données pour l'administration fiscale.">
      <svg viewBox="0 0 900 360" className="mkt-flow-svg">
        <defs>
          <linearGradient id="rfe-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FBB040" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <marker id="rfe-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" fill="#C2410C" />
          </marker>
        </defs>

        {/* Emetteur */}
        <g>
          <rect x="20" y="150" width="150" height="70" rx="16" fill="#fff" stroke="#F5D9BE" strokeWidth="1.5" />
          <text x="95" y="182" textAnchor="middle" className="mkt-flow-t">Fournisseur</text>
          <text x="95" y="201" textAnchor="middle" className="mkt-flow-s">émet la facture</text>
        </g>

        {/* PA émetteur */}
        <g>
          <rect x="235" y="150" width="150" height="70" rx="16" fill="url(#rfe-g)" />
          <text x="310" y="180" textAnchor="middle" className="mkt-flow-t" fill="#fff">Plateforme</text>
          <text x="310" y="199" textAnchor="middle" className="mkt-flow-t" fill="#fff">agréée (PA)</text>
        </g>

        {/* PA récepteur */}
        <g>
          <rect x="515" y="150" width="150" height="70" rx="16" fill="url(#rfe-g)" />
          <text x="590" y="180" textAnchor="middle" className="mkt-flow-t" fill="#fff">Plateforme</text>
          <text x="590" y="199" textAnchor="middle" className="mkt-flow-t" fill="#fff">agréée (PA)</text>
        </g>

        {/* Client */}
        <g>
          <rect x="730" y="150" width="150" height="70" rx="16" fill="#fff" stroke="#F5D9BE" strokeWidth="1.5" />
          <text x="805" y="182" textAnchor="middle" className="mkt-flow-t">Client</text>
          <text x="805" y="201" textAnchor="middle" className="mkt-flow-s">reçoit la facture</text>
        </g>

        {/* PPF */}
        <g>
          <rect x="375" y="20" width="150" height="66" rx="16" fill="#1f1206" />
          <text x="450" y="48" textAnchor="middle" className="mkt-flow-t" fill="#FBB040">PPF</text>
          <text x="450" y="67" textAnchor="middle" className="mkt-flow-s" fill="#f6d9be">annuaire + données</text>
        </g>

        {/* Administration fiscale */}
        <g>
          <rect x="375" y="290" width="150" height="56" rx="16" fill="#fff" stroke="#F5D9BE" strokeWidth="1.5" />
          <text x="450" y="323" textAnchor="middle" className="mkt-flow-t">Administration fiscale</text>
        </g>

        {/* Flèches horizontales */}
        <line x1="170" y1="185" x2="230" y2="185" stroke="#C2410C" strokeWidth="2.5" markerEnd="url(#rfe-arrow)" />
        <line x1="385" y1="185" x2="510" y2="185" stroke="#C2410C" strokeWidth="2.5" markerEnd="url(#rfe-arrow)" />
        <line x1="665" y1="185" x2="725" y2="185" stroke="#C2410C" strokeWidth="2.5" markerEnd="url(#rfe-arrow)" />

        {/* PA -> PPF (données) */}
        <line x1="310" y1="150" x2="410" y2="88" stroke="#C2410C" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#rfe-arrow)" />
        <line x1="590" y1="150" x2="490" y2="88" stroke="#C2410C" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#rfe-arrow)" />
        {/* PPF -> administration */}
        <line x1="450" y1="86" x2="450" y2="288" stroke="#C2410C" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#rfe-arrow)" />
      </svg>
      <p className="mkt-flow-legend">
        <span>— &nbsp;Flux de la facture&nbsp;&nbsp;</span>
        <span className="dash">┄ &nbsp;Remontée des données à l&apos;administration</span>
      </p>
    </div>
  );
}
