import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageRevision } from "@/lib/permissions";
import { RevisionDossierView } from "./revision-dossier-view";

export default async function RevisionDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (!canManageRevision(session.user?.role)) redirect("/app");

  const { id } = await params;

  return (
    <div className="space-y-6">
      <RevisionDossierView dossierId={id} role={session.user?.role ?? null} />
    </div>
  );
}
