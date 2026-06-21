import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageValuationBranding } from "@/lib/permissions";
import { getValuationBranding, saveValuationBranding } from "@/lib/valuation/branding";

export async function GET() {
  const session = await auth();
  if (!session || !canManageValuationBranding(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getValuationBranding());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageValuationBranding(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { cabinetName, logoUrl, primaryColor, fontFamily, legalMentions, signatureName, signatureTitle } = body;

  const saved = await saveValuationBranding({
    cabinetName: typeof cabinetName === "string" ? cabinetName : undefined,
    logoUrl: typeof logoUrl === "string" ? logoUrl : logoUrl === null ? null : undefined,
    primaryColor: typeof primaryColor === "string" ? primaryColor.replace(/^#/, "") : undefined,
    fontFamily: typeof fontFamily === "string" ? fontFamily : undefined,
    legalMentions: typeof legalMentions === "string" ? legalMentions : undefined,
    signatureName: typeof signatureName === "string" ? signatureName : undefined,
    signatureTitle: typeof signatureTitle === "string" ? signatureTitle : undefined,
  });

  return NextResponse.json(saved);
}
