// URL publique du site. Surchargée en production via NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.trevys.fr"
).replace(/\/$/, "");
