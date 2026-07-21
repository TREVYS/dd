/**
 * Logo officiel « Ordre des Experts-Comptables — Région Paris Île-de-France ».
 * Le fichier doit être présent dans public/brand/oec-logo.png
 * (déposé dans le dépôt, ou via l'espace Médias du back-office).
 */
export function OecLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src="/uploads/oec-logo.png"
      alt="Ordre des Experts-Comptables — Région Paris Île-de-France"
    />
  );
}
