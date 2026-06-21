import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";
import { generateNarrative } from "@/lib/valuation/analyst";
import type { FinancialInputs, ValuationResults } from "@/lib/valuation/engine";
import { z } from "zod";

const Schema = z.object({
  inputs: z.custom<FinancialInputs>(),
  results: z.custom<ValuationResults>(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const narrative = await generateNarrative(parsed.data.inputs, parsed.data.results);
  return NextResponse.json(narrative);
}
