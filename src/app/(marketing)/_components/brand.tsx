export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Trevys, Expertise Comptable et Conseil"
    >
      <text
        x="0"
        y="56"
        fontFamily="'Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif"
        fontWeight="900"
        fontSize="62"
        letterSpacing="-3.5"
        fill="currentColor"
      >
        Trevys
      </text>
      <path d="M190 26 L190 6 L204 6 A20 20 0 0 1 224 26 Z" fill="#F59E0B" />
      <text
        x="1.5"
        y="76"
        fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif"
        fontWeight="500"
        fontSize="8.4"
        letterSpacing="2.3"
        fill="currentColor"
        opacity="0.8"
      >
        EXPERTISE COMPTABLE &amp; CONSEIL
      </text>
    </svg>
  );
}
