import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex w-full">
      <Sidebar
        userName={session?.user?.name ?? "Utilisateur"}
        userRole={session?.user?.role ?? null}
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
