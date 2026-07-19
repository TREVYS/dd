/**
 * Logo « Ordre des Experts-Comptables » — rendu vectoriel de substitution.
 * Pour le logo officiel exact, déposer le fichier dans public/brand/oec.svg
 * (ou .png) et remplacer ce composant par une balise <img>.
 */
export function OecLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 66"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ordre des Experts-Comptables"
      fill="none"
    >
      <text
        x="0"
        y="28"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="0.5"
        fill="#182a6b"
      >
        ORDRE DES
      </text>
      <text
        x="0"
        y="52"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="0.5"
        fill="#182a6b"
      >
        EXPERTS-COMPTABLES
      </text>
      <text
        x="252"
        y="50"
        fontFamily="'Segoe Script','Brush Script MT',Georgia,cursive"
        fontStyle="italic"
        fontWeight="600"
        fontSize="46"
        fill="#5566a8"
      >
        ec
      </text>
    </svg>
  );
}
