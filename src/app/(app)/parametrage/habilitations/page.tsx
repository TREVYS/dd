import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageHabilitations } from "@/lib/permissions";
import { HabilitationsManager } from "./habilitations-manager";

export default async function HabilitationsPage() {
  const session = await auth();
  if (!canManageHabilitations(session?.user?.role)) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Droits d&apos;accès &amp; habilitations</h1>
      <HabilitationsManager />
    </div>
  );
}
