import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";
import { recommendMethods } from "@/lib/valuation/analyst";
import type { FinancialInputs } from "@/lib/valuation/engine";
import { z } from "zod";

const Schema = z.object({ inputs: z.custom<FinancialInputs>() });

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

  const recommendation = await recommendMethods(parsed.data.inputs);
  return NextResponse.json(recommendation);
}
