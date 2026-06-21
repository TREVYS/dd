import { prisma } from "@/lib/prisma";

export type ValuationBranding = {
  cabinetName: string;
  logoUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  legalMentions: string;
  signatureName: string;
  signatureTitle: string;
};

const SETTINGS_KEY = "valuationBranding";

export const DEFAULT_VALUATION_BRANDING: ValuationBranding = {
  cabinetName: "TREVYS",
  logoUrl: null,
  primaryColor: "6D5BF6",
  fontFamily: "Calibri",
  legalMentions: "",
  signatureName: "",
  signatureTitle: "",
};

export async function getValuationBranding(): Promise<ValuationBranding> {
  const stored = await prisma.appSetting.findUnique({ where: { key: SETTINGS_KEY } });
  const saved = (stored?.value as Partial<ValuationBranding>) ?? {};
  return { ...DEFAULT_VALUATION_BRANDING, ...saved };
}

export async function saveValuationBranding(
  patch: Partial<ValuationBranding>
): Promise<ValuationBranding> {
  const existing = await getValuationBranding();
  const value: ValuationBranding = { ...existing, ...patch };

  await prisma.appSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value },
    update: { value },
  });
  return value;
}
