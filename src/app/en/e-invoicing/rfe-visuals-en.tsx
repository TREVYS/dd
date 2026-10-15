// English variant of the invoicing circuit diagram (src/app/(marketing)/facturation-electronique/rfe-visuals.tsx).

const IcSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M6 11l6-6 6 6" />
    <path d="M4 21h16" />
  </svg>
);
const IcReceive = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M6 13l6 6 6-6" />
    <path d="M4 3h16" />
  </svg>
);
const IcShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export function RfeFlowEn() {
  return (
    <div className="mkt-circuit">
      <div className="mkt-circuit-row">
        <div className="mkt-cnode">
          <span className="ic"><IcSend /></span>
          <b>Supplier</b>
          <small>issues the invoice</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode hot">
          <span className="ic"><IcShield /></span>
          <b>Certified Platform</b>
          <small>issuing PDP</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode hot">
          <span className="ic"><IcShield /></span>
          <b>Certified Platform</b>
          <small>receiving PDP</small>
        </div>
        <div className="mkt-carrow" aria-hidden="true" />
        <div className="mkt-cnode">
          <span className="ic"><IcReceive /></span>
          <b>Customer</b>
          <small>receives the invoice</small>
        </div>
      </div>

      <div className="mkt-circuit-data">
        <div className="mkt-circuit-updown" aria-hidden="true" />
        <div className="mkt-cnode dark">
          <b>PPF · Public Invoicing Portal</b>
          <small>business directory &amp; data hub → tax administration</small>
        </div>
      </div>
    </div>
  );
}
