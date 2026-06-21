type FolderOption = {
  id: string;
  name: string;
  folderType: string | null;
  fiscalYear: number | null;
};

export type ClassificationSuggestion = {
  documentType: string;
  category: string;
  fiscalYear: number | null;
  folderId: string | null;
  folderLabel: string | null;
  reasoning: string;
  source: "ai" | "heuristic";
};

const KEYWORD_RULES: { match: RegExp; documentType: string; category: string; folderType: string }[] = [
  { match: /\bTVA\b|taxe sur la valeur ajout/i, documentType: "Déclaration TVA", category: "fiscal", folderType: "declaration_taxe" },
  { match: /\bCFE\b|cotisation fonci.re/i, documentType: "Déclaration CFE", category: "fiscal", folderType: "declaration_taxe" },
  { match: /\bCVAE\b/i, documentType: "Déclaration CVAE", category: "fiscal", folderType: "declaration_taxe" },
  { match: /\bDAS-?2\b/i, documentType: "Déclaration DAS2", category: "fiscal", folderType: "declaration_taxe" },
  { match: /\bIS\b|impot sur les soci.t.s|impôt sur les sociétés/i, documentType: "Déclaration IS", category: "fiscal", folderType: "declaration_taxe" },
  { match: /bulletin de (paie|salaire)|fiche de paie/i, documentType: "Bulletin de paie", category: "social", folderType: "social" },
  { match: /contrat de travail|avenant/i, documentType: "Contrat de travail", category: "social", folderType: "social" },
  { match: /\bFEC\b|fichier des .critures comptables/i, documentType: "FEC", category: "cloture", folderType: "cloture_element" },
  { match: /liasse fiscale/i, documentType: "Liasse fiscale", category: "cloture", folderType: "cloture_element" },
  { match: /bilan|compte de r.sultat/i, documentType: "Bilan", category: "cloture", folderType: "cloture_element" },
  { match: /plaquette/i, documentType: "Plaquette", category: "cloture", folderType: "cloture_element" },
  { match: /lettre de mission/i, documentType: "Lettre de mission", category: "permanent", folderType: "lettre_mission" },
  { match: /statuts|extrait kbis|k-?bis|immatriculation/i, documentType: "Document juridique", category: "juridique", folderType: "juridique" },
  { match: /pr.t|emprunt|.ch.ancier/i, documentType: "Tableau d'emprunt", category: "permanent", folderType: "emprunts" },
  { match: /facture/i, documentType: "Facture", category: "comptabilite", folderType: "comptabilite_mois" },
  { match: /releve bancaire|relevé bancaire/i, documentType: "Relevé bancaire", category: "comptabilite", folderType: "comptabilite_mois" },
];

function guessFiscalYear(text: string): number | null {
  const years = [...text.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
  if (years.length === 0) return null;
  const counts = new Map<number, number>();
  for (const y of years) counts.set(y, (counts.get(y) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function heuristicClassify(
  fileName: string,
  ocrText: string | null,
  folders: FolderOption[]
): ClassificationSuggestion {
  const haystack = `${fileName}\n${ocrText ?? ""}`;
  const rule = KEYWORD_RULES.find((r) => r.match.test(haystack));
  const fiscalYear = guessFiscalYear(haystack) ?? new Date().getFullYear();

  const documentType = rule?.documentType ?? "Document divers";
  const category = rule?.category ?? "divers";
  const folderType = rule?.folderType ?? "divers";

  const folder =
    folders.find((f) => f.folderType === folderType && f.fiscalYear === fiscalYear) ??
    folders.find((f) => f.folderType === folderType) ??
    null;

  return {
    documentType,
    category,
    fiscalYear,
    folderId: folder?.id ?? null,
    folderLabel: folder?.name ?? null,
    reasoning: rule
      ? `Mots-clés détectés correspondant à « ${documentType} ».`
      : "Aucun mot-clé reconnu, classement par défaut dans Divers.",
    source: "heuristic",
  };
}

export async function classifyDocument(
  fileName: string,
  ocrText: string | null,
  folders: FolderOption[]
): Promise<ClassificationSuggestion> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return heuristicClassify(fileName, ocrText, folders);
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const folderList = folders
      .map((f) => `- id: ${f.id}, nom: ${f.name}, type: ${f.folderType}, exercice: ${f.fiscalYear ?? "n/a"}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Tu es un assistant pour un cabinet d'expertise comptable. Classe ce document.
Nom du fichier: ${fileName}
Texte extrait (OCR, tronqué): ${(ocrText ?? "").slice(0, 3000)}

Dossiers disponibles pour ce client:
${folderList || "(aucun dossier existant)"}

Réponds UNIQUEMENT en JSON avec ce format exact:
{"documentType": "...", "category": "...", "fiscalYear": 2024, "folderId": "id-du-dossier-ou-null", "reasoning": "..."}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no json in AI response");
    const parsed = JSON.parse(jsonMatch[0]);
    const folder = folders.find((f) => f.id === parsed.folderId) ?? null;

    return {
      documentType: parsed.documentType ?? "Document divers",
      category: parsed.category ?? "divers",
      fiscalYear: parsed.fiscalYear ?? null,
      folderId: folder?.id ?? null,
      folderLabel: folder?.name ?? null,
      reasoning: parsed.reasoning ?? "Classement proposé par l'IA.",
      source: "ai",
    };
  } catch {
    return heuristicClassify(fileName, ocrText, folders);
  }
}
