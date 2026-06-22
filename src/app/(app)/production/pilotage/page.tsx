import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageTaskPilotage } from "@/lib/permissions";
import { PilotageView } from "./pilotage-view";

export default async function PilotagePage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageTaskPilotage(session.user?.role)) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pilotage des travaux</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vision globale de la charge du cabinet, affectation des tâches et équilibrage des équipes.
        </p>
      </div>
      <PilotageView />
    </div>
  );
}
