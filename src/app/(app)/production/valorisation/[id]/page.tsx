import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageValuations } from "@/lib/permissions";
import { ValuationWizard } from "./valuation-wizard";

export default async function ValuationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageValuations(session.user?.role)) redirect("/");

  const { id } = await params;

  return (
    <div className="space-y-6">
      <ValuationWizard valuationId={id} />
    </div>
  );
}
