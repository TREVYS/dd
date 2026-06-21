import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
} from "docx";
import { readFile } from "fs/promises";
import path from "path";
import type { FinancialInputs, ValuationResults } from "./engine";
import type { ValuationNarrative } from "./analyst";
import type { ValuationBranding } from "./branding";
import { DEFAULT_VALUATION_BRANDING } from "./branding";

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? "—"
    : `${Math.round(n).toLocaleString("fr-FR")} €`;

function cell(text: string, opts: { bold?: boolean; width?: number } = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold })] })],
  });
}

function table(rows: [string, string][], header?: [string, string]) {
  const allRows = header ? [header, ...rows] : rows;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: allRows.map(
      ([a, b], i) =>
        new TableRow({
          children: [cell(a, { bold: i === 0 && Boolean(header), width: 60 }), cell(b, { bold: i === 0 && Boolean(header), width: 40 })],
        })
    ),
  });
}

function paragraphsFromText(text: string) {
  return text
    .split(/\n+/)
    .filter((l) => l.trim().length > 0)
    .map((l) => new Paragraph({ text: l, spacing: { after: 160 } }));
}

export async function generateValuationDocx(opts: {
  companyName: string;
  cabinetName?: string;
  date: Date;
  inputs: FinancialInputs;
  results: ValuationResults;
  narrative: ValuationNarrative;
  branding?: ValuationBranding;
}): Promise<Buffer> {
  const { companyName, date, inputs, results, narrative } = opts;
  const branding = opts.branding ?? DEFAULT_VALUATION_BRANDING;
  const cabinetName = opts.cabinetName ?? branding.cabinetName;
  const color = branding.primaryColor;
  const font = branding.fontFamily;

  let logoImage: ImageRun | null = null;
  if (branding.logoUrl) {
    try {
      const filePath = path.join(process.cwd(), "public", branding.logoUrl.replace(/^\//, ""));
      const data = await readFile(filePath);
      logoImage = new ImageRun({
        type: "png",
        data,
        transformation: { width: 120, height: 60 },
      });
    } catch {
      logoImage = null;
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font } },
      },
    },
    sections: [
      {
        children: [
          ...(logoImage
            ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 }, children: [logoImage] })]
            : []),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: logoImage ? 0 : 2400, after: 200 },
            children: [new TextRun({ text: cabinetName, bold: true, size: 28, color })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
            children: [new TextRun({ text: "Rapport de valorisation d'entreprise" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            children: [
              new TextRun({ text: companyName, bold: true, size: 26 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
              }),
            ],
          }),

          new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, text: "Synthèse exécutive" }),
          ...paragraphsFromText(narrative.conclusion),

          new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Présentation et analyse financière" }),
          table(
            [
              ["Chiffre d'affaires", fmt(inputs.chiffreAffaires)],
              ["EBITDA (EBE)", fmt(inputs.ebitda)],
              ["EBIT (résultat d'exploitation)", fmt(inputs.ebit)],
              ["Résultat net", fmt(inputs.resultatNet)],
              ["Dette financière nette", fmt(inputs.netDebt)],
              ["Capitaux propres comptables", fmt(inputs.capitauxPropres)],
            ],
            ["Indicateur", "Valeur"]
          ),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          ...paragraphsFromText(narrative.financialAnalysis),

          new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Méthodes de valorisation retenues" }),
          ...paragraphsFromText(narrative.methodsExplanation),
          table(
            [
              ["DCF", fmt(results.dcf?.equityValue ?? null)],
              ["Multiples (moyenne)", fmt(results.multiples?.averageEquityValue ?? null)],
              ["Actif net réévalué", fmt(results.anr?.equityValue ?? null)],
            ],
            ["Méthode", "Valeur des capitaux propres"]
          ),

          new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Hypothèses retenues" }),
          ...paragraphsFromText(narrative.assumptionsExplanation),
          table([
            ["Pondération DCF", `${Math.round(results.weights.dcf * 100)} %`],
            ["Pondération Multiples", `${Math.round(results.weights.multiples * 100)} %`],
            ["Pondération ANR", `${Math.round(results.weights.anr * 100)} %`],
          ]),

          new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Résultats de la valorisation" }),
          table(
            [
              ["Valeur minimale", fmt(results.min)],
              ["Valeur médiane", fmt(results.median)],
              ["Valeur retenue (pondérée)", fmt(results.weightedEquityValue)],
              ["Valeur maximale", fmt(results.max)],
            ],
            ["Indicateur", "Montant"]
          ),

          new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Conclusion" }),
          ...paragraphsFromText(narrative.conclusion),

          ...(branding.signatureName
            ? [
                new Paragraph({ spacing: { before: 800 }, text: "" }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: branding.signatureName, bold: true })],
                }),
                ...(branding.signatureTitle
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: branding.signatureTitle, italics: true, size: 18 })],
                      }),
                    ]
                  : []),
              ]
            : []),

          ...(branding.legalMentions
            ? [
                new Paragraph({
                  spacing: { before: 800 },
                  children: [new TextRun({ text: branding.legalMentions, italics: true, size: 16 })],
                }),
              ]
            : []),

          new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: "Document confidentiel à usage interne et du dirigeant.", italics: true, size: 18 })],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
