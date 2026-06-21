import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatApp } from "./chat-app";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();

  const users = await prisma.user.findMany({
    where: { status: "active", id: { not: session!.user.id } },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, email: true },
  });

  return (
    <div className="h-[80vh]">
      <ChatApp
        currentUserId={session!.user.id}
        users={users.map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email }))}
        openWithUserId={sp.with ?? null}
      />
    </div>
  );
}
