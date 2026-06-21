import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageValuations } from "@/lib/permissions";
import { ValorisationListView } from "./valorisation-list-view";

export default async function ValorisationPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageValuations(session.user?.role)) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Valorisation d&apos;entreprise</h1>
        <p className="text-sm text-gray-500 mt-1">
          DCF, multiples et actif net réévalué, assistés par IA, avec rapport Word en un clic.
        </p>
      </div>
      <ValorisationListView />
    </div>
  );
}
