import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageAcademy } from "@/lib/permissions";
import { AcademyManager } from "./academy-manager";

export default async function AcademyAdminPage() {
  const session = await auth();
  if (!canManageAcademy(session?.user?.role)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Academy TREVYS</h1>
      <AcademyManager role={session?.user?.role ?? null} />
    </div>
  );
}
