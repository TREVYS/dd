import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageValuationBranding } from "@/lib/permissions";
import { ValuationBrandingManager } from "./valuation-branding-manager";

export default async function ValuationBrandingPage() {
  const session = await auth();
  if (!canManageValuationBranding(session?.user?.role)) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Personnalisation des rapports de valorisation</h1>
      <ValuationBrandingManager />
    </div>
  );
}
