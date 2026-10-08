import Link from "next/link";

// Lien simple vers la page anglaise du site.
export function LangToggle() {
  return (
    <Link href="/en" className="btn btn-sm btn-ghost mkt-lang-toggle" aria-label="English version">
      EN
    </Link>
  );
}
