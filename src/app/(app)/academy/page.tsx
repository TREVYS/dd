import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AcademyView } from "./academy-view";

export default async function AcademyPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Academy TREVYS</h1>
      <AcademyView />
    </div>
  );
}
