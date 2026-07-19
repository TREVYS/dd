import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRevision } from "@/lib/permissions";
import { RevisionListView } from "./revision-list-view";

export default async function RevisionPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageRevision(session.user?.role)) redirect("/app");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Révision comptable assistée par FEC</h1>
        <p className="text-sm text-gray-500 mt-1">
          Créez un dossier de révision par cycle, importez le FEC du client et suivez la validation manager / associé.
        </p>
      </div>
      <RevisionListView />
    </div>
  );
}
