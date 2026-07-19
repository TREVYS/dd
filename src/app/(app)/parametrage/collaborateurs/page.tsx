import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageCollaborators } from "@/lib/permissions";
import { CollaboratorsManager } from "./collaborators-manager";

export default async function CollaborateursPage() {
  const session = await auth();
  if (!canManageCollaborators(session?.user?.role)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Collaborateurs</h1>
      <CollaboratorsManager />
    </div>
  );
}
