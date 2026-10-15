"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EN_TO_FR } from "@/lib/i18n-pages";

export function EnFrLink() {
  const pathname = usePathname();
  const target = EN_TO_FR[pathname] ?? "/";
  return (
    <Link href={target} style={{ color: "var(--ink3)", textDecoration: "none", fontSize: ".85rem" }}>
      FR 🇫🇷
    </Link>
  );
}
