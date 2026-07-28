import { auth } from "@/lib/auth";
import { PROFILS } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Modèle de fichier d'import (CSV point-virgule, encodage Excel-compatible).
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Non autorisé", { status: 401 });

  const lines = [
    "email;nom;client;profil",
    "jean.dupont@exemple.fr;Jean Dupont;oui;DAF",
    "marie.martin@exemple.fr;Marie Martin;non;BNC santé",
    "paul.durand@exemple.fr;Paul Durand;oui;Dirigeant",
    "",
    `# client : oui / non — profil suggéré : ${PROFILS.join(" / ")} (saisie libre acceptée)`,
    "# Supprimez ces lignes d'exemple et ces commentaires avant l'import.",
  ];
  // BOM UTF-8 : Excel ouvre correctement les accents.
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele-contacts-trevys.csv"',
      "Cache-Control": "no-store",
    },
  });
}
