import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const mailsToTreat = session?.user?.id
    ? await prisma.mail.count({
        where: { recipientId: session.user.id, status: "a_traiter" },
      })
    : 0;

  return (
    <div className="flex w-full">
      <Sidebar mailsToTreat={mailsToTreat} />
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
