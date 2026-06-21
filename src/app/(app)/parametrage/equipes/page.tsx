import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageCollaborators } from "@/lib/permissions";
import { TeamsManager } from "./teams-manager";

export default async function EquipesPage() {
  const session = await auth();
  if (!canManageCollaborators(session?.user?.role)) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Équipes</h1>
      <TeamsManager />
    </div>
  );
}
