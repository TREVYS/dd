import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canManageFecAnalysis } from "@/lib/permissions";
import { FecAnalyseView } from "./fec-analyse-view";

export default async function FecAnalysePage() {
  const session = await auth();
  if (!canManageFecAnalysis(session?.user?.role)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reporting</h1>
        <p className="text-sm text-gray-500">
          Importez un FEC client, laissez l&apos;IA contrôler et analyser les écritures, puis générez un rapport partageable.
        </p>
      </div>
      <FecAnalyseView />
    </div>
  );
}
