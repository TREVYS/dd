const REQUIRED_COLUMNS = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "Debit",
  "Credit",
];

export type FecLine = {
  journalCode: string;
  journalLib: string;
  ecritureNum: string;
  ecritureDate: string; // YYYYMMDD
  compteNum: string;
  compteLib: string;
  compAuxNum: string;
  compAuxLib: string;
  pieceRef: string;
  pieceDate: string;
  ecritureLib: string;
  debit: number;
  credit: number;
  ecritureLet: string;
  dateLet: string;
  validDate: string;
};

export type ParsedFec = {
  columns: string[];
  lines: FecLine[];
  missingColumns: string[];
};

function detectDelimiter(headerLine: string): string {
  const candidates = ["\t", "|", ";", ","];
  let best = "\t";
  let bestCount = 0;
  for (const candidate of candidates) {
    const count = headerLine.split(candidate).length;
    if (count > bestCount) {
      bestCount = count;
      best = candidate;
    }
  }
  return best;
}

function toNumber(raw: string | undefined): number {
  if (!raw) return 0;
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function parseFec(rawContent: string): ParsedFec {
  const content = rawContent.replace(/^﻿/, "");
  const rows = content.split(/\r\n|\r|\n/).filter((row) => row.trim().length > 0);

  if (rows.length === 0) {
    return { columns: [], lines: [], missingColumns: REQUIRED_COLUMNS };
  }

  const delimiter = detectDelimiter(rows[0]);
  const columns = rows[0].split(delimiter).map((col) => col.trim());
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !columns.includes(col));

  const index = (name: string) => columns.indexOf(name);

  const lines: FecLine[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split(delimiter);
    if (cells.length < 2) continue;
    const get = (name: string) => {
      const idx = index(name);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };
    lines.push({
      journalCode: get("JournalCode"),
      journalLib: get("JournalLib"),
      ecritureNum: get("EcritureNum"),
      ecritureDate: get("EcritureDate"),
      compteNum: get("CompteNum"),
      compteLib: get("CompteLib"),
      compAuxNum: get("CompAuxNum"),
      compAuxLib: get("CompAuxLib"),
      pieceRef: get("PieceRef"),
      pieceDate: get("PieceDate"),
      ecritureLib: get("EcritureLib"),
      debit: toNumber(get("Debit")),
      credit: toNumber(get("Credit")),
      ecritureLet: get("EcritureLet"),
      dateLet: get("DateLet"),
      validDate: get("ValidDate"),
    });
  }

  return { columns, lines, missingColumns };
}

export function fecDateToISO(fecDate: string): string | null {
  if (!fecDate || fecDate.length < 8) return null;
  const year = fecDate.slice(0, 4);
  const month = fecDate.slice(4, 6);
  const day = fecDate.slice(6, 8);
  const date = `${year}-${month}-${day}`;
  return Number.isFinite(new Date(date).getTime()) ? date : null;
}
