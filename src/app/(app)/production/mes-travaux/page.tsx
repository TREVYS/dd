import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MesTravauxView } from "./mes-travaux-view";

export default async function MesTravauxPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mes travaux</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vos tâches du jour, de la semaine, vos retards et les validations en attente.
        </p>
      </div>
      <MesTravauxView
        userId={session.user.id}
        canValidate={session.user?.role === "Associé" || session.user?.role === "Administrateur" || session.user?.role === "Manager"}
      />
    </div>
  );
}
