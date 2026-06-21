import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar
          userName={session?.user?.name ?? "Utilisateur"}
          userRole={session?.user?.role ?? null}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
