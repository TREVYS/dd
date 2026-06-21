import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";
import { generateNarrative } from "@/lib/valuation/analyst";
import { generateValuationDocx } from "@/lib/valuation/docx-report";
import type { FinancialInputs, ValuationResults } from "@/lib/valuation/engine";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const valuation = await prisma.valuation.findUnique({
    where: { id },
    include: {
      client: { select: { legalName: true } },
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const version = valuation?.versions[0];
  if (!valuation || !version) {
    return NextResponse.json({ error: "Aucune version calculée pour ce dossier." }, { status: 400 });
  }

  const inputs = version.inputs as unknown as FinancialInputs;
  const results = version.results as unknown as ValuationResults;
  const narrative =
    (version.aiNarrative as Awaited<ReturnType<typeof generateNarrative>> | null) ?? (await generateNarrative(inputs, results));

  const buffer = await generateValuationDocx({
    companyName: valuation.client.legalName,
    cabinetName: "TREVYS",
    date: new Date(),
    inputs,
    results,
    narrative,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="valorisation-${valuation.client.legalName.replace(/[^a-z0-9]+/gi, "-")}.docx"`,
    },
  });
}
