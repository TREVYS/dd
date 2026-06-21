import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";
import {
  computeValuation,
  computeSensitivity,
  computeScenarios,
  type FinancialInputs,
  type MethodWeights,
  type DcfAssumptions,
  type MultipleLine,
  type AnrAssumptions,
  type Scenario,
} from "@/lib/valuation/engine";
import { z } from "zod";

const VersionSchema = z.object({
  label: z.string().min(1),
  inputs: z.custom<FinancialInputs>(),
  methodWeights: z.custom<MethodWeights>(),
  dcfAssumptions: z.custom<DcfAssumptions>().nullable(),
  multipleLines: z.array(z.custom<MultipleLine>()).nullable(),
  anrAssumptions: z.custom<AnrAssumptions>().nullable(),
  scenarios: z.array(z.custom<Scenario>()).default([]),
  aiRecommendation: z.any().nullable().optional(),
  aiNarrative: z.any().nullable().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const valuation = await prisma.valuation.findUnique({ where: { id } });
  if (!valuation) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json();
  const parsed = VersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { inputs, methodWeights, dcfAssumptions, multipleLines, anrAssumptions, scenarios, label, aiRecommendation, aiNarrative } =
    parsed.data;

  const results = computeValuation(inputs, methodWeights, dcfAssumptions, multipleLines, anrAssumptions);

  const sensitivity = dcfAssumptions
    ? computeSensitivity(
        dcfAssumptions,
        inputs.netDebt,
        [dcfAssumptions.wacc - 2, dcfAssumptions.wacc - 1, dcfAssumptions.wacc, dcfAssumptions.wacc + 1, dcfAssumptions.wacc + 2],
        [
          dcfAssumptions.terminalGrowthRate - 1,
          dcfAssumptions.terminalGrowthRate - 0.5,
          dcfAssumptions.terminalGrowthRate,
          dcfAssumptions.terminalGrowthRate + 0.5,
          dcfAssumptions.terminalGrowthRate + 1,
        ]
      )
    : null;

  const scenarioResults = scenarios.length > 0 ? computeScenarios(inputs, scenarios) : [];

  const version = await prisma.valuationVersion.create({
    data: {
      valuationId: id,
      label,
      inputs,
      methodWeights,
      assumptions: { dcfAssumptions, multipleLines, anrAssumptions },
      scenarios: scenarioResults,
      results,
      sensitivity: sensitivity ?? undefined,
      aiRecommendation: aiRecommendation ?? undefined,
      aiNarrative: aiNarrative ?? undefined,
      createdById: session.user.id,
    },
  });

  await prisma.valuation.update({
    where: { id },
    data: { status: "in_progress", companyData: inputs as object },
  });

  return NextResponse.json(version, { status: 201 });
}
