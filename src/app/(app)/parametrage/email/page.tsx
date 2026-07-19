import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageEmailSettings } from "@/lib/permissions";
import { EmailSettingsManager } from "./email-settings-manager";

export default async function EmailSettingsPage() {
  const session = await auth();
  if (!canManageEmailSettings(session?.user?.role)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Envoi de mail</h1>
      <EmailSettingsManager />
    </div>
  );
}
