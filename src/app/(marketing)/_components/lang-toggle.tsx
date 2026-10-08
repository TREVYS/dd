"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FR_TO_EN } from "@/lib/i18n-pages";

// Lien vers la vraie page anglaise équivalente (pas de traduction à la
// volée : des pages /en écrites et maintenues). Retombe sur l'accueil
// anglaise si la page courante n'a pas encore d'équivalent.
export function LangToggle() {
  const pathname = usePathname();
  const target = FR_TO_EN[pathname] ?? "/en";
  return (
    <Link href={target} className="btn btn-sm btn-ghost mkt-lang-toggle" aria-label="Switch to English">
      EN
    </Link>
  );
}
