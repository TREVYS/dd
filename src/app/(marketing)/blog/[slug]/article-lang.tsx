import Link from "next/link";

// Lien de bascule vers la version de l'article dans l'autre langue.
export function ArticleLangLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ color: "var(--violet)", fontWeight: 700, fontSize: ".85rem" }}>
      {children}
    </Link>
  );
}
