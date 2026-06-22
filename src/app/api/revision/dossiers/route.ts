import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRevision } from "@/lib/permissions";
import { buildCyclesForDossier } from "@/lib/revision/cycles";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("clientId");
  const dossiers = await prisma.revisionDossier.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, legalName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { cycles: true } },
    },
    take: 100,
  });

  return NextResponse.json(dossiers);
}

const DossierSchema = z.object({
  clientId: z.string().min(1),
  fiscalYear: z.coerce.number().int(),
  openingDate: z.string().optional().nullable(),
  closingDate: z.string().optional().nullable(),
  sectorActivity: z.string().optional().nullable(),
  clientTypology: z.string().optional().nullable(),
  taxRegime: z.string().optional().nullable(),
  vatRegime: z.string().optional().nullable(),
  hasEmployees: z.boolean().default(false),
  hasStocks: z.boolean().default(false),
  hasLoans: z.boolean().default(false),
  hasFixedAssets: z.boolean().default(false),
  hasCurrentAccounts: z.boolean().default(false),
  hasTaxGroup: z.boolean().default(false),
  riskLevel: z.enum(["faible", "normal", "eleve"]).default("normal"),
  fecImportId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageRevision(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = DossierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const cycles = buildCyclesForDossier({
    hasEmployees: data.hasEmployees,
    hasStocks: data.hasStocks,
    hasLoans: data.hasLoans,
    hasFixedAssets: data.hasFixedAssets,
    hasCurrentAccounts: data.hasCurrentAccounts,
    hasTaxGroup: data.hasTaxGroup,
    clientTypology: data.clientTypology,
  });

  const dossier = await prisma.revisionDossier.create({
    data: {
      clientId: data.clientId,
      fiscalYear: data.fiscalYear,
      openingDate: data.openingDate ? new Date(data.openingDate) : null,
      closingDate: data.closingDate ? new Date(data.closingDate) : null,
      sectorActivity: data.sectorActivity,
      clientTypology: data.clientTypology,
      taxRegime: data.taxRegime,
      vatRegime: data.vatRegime,
      hasEmployees: data.hasEmployees,
      hasStocks: data.hasStocks,
      hasLoans: data.hasLoans,
      hasFixedAssets: data.hasFixedAssets,
      hasCurrentAccounts: data.hasCurrentAccounts,
      hasTaxGroup: data.hasTaxGroup,
      riskLevel: data.riskLevel,
      fecImportId: data.fecImportId,
      createdById: session.user?.id,
      status: "en_cours",
      cycles: { create: cycles },
    },
    include: { cycles: true },
  });

  return NextResponse.json(dossier, { status: 201 });
}
