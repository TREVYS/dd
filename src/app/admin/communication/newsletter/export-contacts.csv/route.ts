import { auth } from "@/lib/auth";
import { listSubscribers } from "@/lib/newsletter";
import { parisToday } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(v: string): string {
  // Point-virgule/guillemets/retours à la ligne → cellule protégée.
  return /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// Export de toute la base de contacts, au format ré-importable tel quel :
// catégorisez dans Excel, réimportez, tout est mis à jour.
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Non autorisé", { status: 401 });

  const rows = listSubscribers().map((s) =>
    [s.email, s.name ?? "", s.client === true ? "oui" : s.client === false ? "non" : "", s.profil ?? ""]
      .map(cell)
      .join(";"),
  );
  const body = "﻿" + ["email;nom;client;profil", ...rows].join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-trevys-${parisToday()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
