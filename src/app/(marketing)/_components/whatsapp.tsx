// Coordonnées WhatsApp du cabinet, centralisées.
// Numéro au format international sans "+" ni espaces pour l'URL wa.me.
export const WA_NUMBER = "33768050465";
export const WA_DISPLAY = "07 68 05 04 65";

const WA_MSG = "Bonjour Trevys, je souhaite échanger avec le cabinet.";

export function waLink(context = "site"): string {
  const msg = encodeURIComponent(WA_MSG);
  return `https://wa.me/${WA_NUMBER}?text=${msg}#${context}`;
}

function WaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.34 4.95L2 22l5.27-1.38a9.9 9.9 0 0 0 4.77 1.21h.01c5.46 0 9.9-4.45 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.06 8.06 0 0 1 2.37 5.73c0 4.47-3.64 8.1-8.11 8.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.05.8.82-2.97-.2-.31a8.02 8.02 0 0 1-1.24-4.31c0-4.47 3.64-8.1 8.11-8.1zm4.68 10.28c-.06-.11-.24-.18-.5-.31-.26-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.6.13-.17.26-.68.85-.83 1.03-.15.18-.31.2-.57.07-.26-.13-1.1-.41-2.1-1.3-.78-.7-1.3-1.55-1.46-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.31.4-.46.13-.15.17-.26.26-.44.09-.18.04-.33-.02-.46-.07-.13-.6-1.42-.82-1.95-.21-.51-.43-.44-.6-.45l-.5-.01c-.18 0-.46.07-.7.33-.24.26-.92.9-.92 2.2 0 1.3.94 2.55 1.07 2.73.13.18 1.85 2.82 4.48 3.96.63.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.55-.63 1.77-1.24.22-.61.22-1.14.15-1.24z" />
    </svg>
  );
}

// Bouton WhatsApp en ligne (dans une page). Vert WhatsApp, moderne.
export function WhatsappButton({
  context = "site",
  label = "Discuter sur WhatsApp",
}: {
  context?: string;
  label?: string;
}) {
  return (
    <a className="mkt-wa-btn" href={waLink(context)} target="_blank" rel="noopener noreferrer">
      <WaIcon />
      <span>{label}</span>
    </a>
  );
}

// Bouton flottant présent sur tout le site.
export function WhatsappFab() {
  return (
    <a
      className="mkt-wa-fab"
      href={waLink("fab")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
    >
      <WaIcon size={28} />
      <span className="mkt-wa-fab-tip">Un projet ? Écrivez-nous 👋</span>
    </a>
  );
}
