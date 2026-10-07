"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLangPref, setLangPref } from "@/lib/lang-pref";

// Si le visiteur a déjà basculé le site en anglais (bouton EN de la nav) et
// qu'une vraie traduction de CET article existe, on l'y envoie directement
// plutôt que de lui laisser une page française à traduire au vol.
export function ArticleLangRedirect({ slug, hasEn }: { slug: string; hasEn: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (hasEn && getLangPref() === "en") router.replace(`/en/blog/${slug}`);
  }, [hasEn, slug, router]);
  return null;
}

// Bascule explicite vers l'autre langue, en mémorisant le choix pour la
// suite de la navigation.
export function ArticleLangLink({
  href,
  lang,
  children,
}: {
  href: string;
  lang: "en" | null;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={() => setLangPref(lang)} style={{ color: "var(--violet)", fontWeight: 700, fontSize: ".85rem" }}>
      {children}
    </Link>
  );
}
