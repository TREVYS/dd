import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MailClient } from "./mail-client";

export default async function MailsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [mails, folders] = userId
    ? await Promise.all([
        prisma.mail.findMany({
          where: { recipientId: userId },
          orderBy: { receivedAt: "desc" },
          include: {
            client: true,
            replies: { orderBy: { createdAt: "asc" }, include: { author: true } },
          },
        }),
        prisma.mailFolder.findMany({
          where: { userId },
          orderBy: { name: "asc" },
        }),
      ])
    : [[], []];

  const mailData = mails.map((mail) => ({
    id: mail.id,
    fromName: mail.fromName,
    fromEmail: mail.fromEmail,
    subject: mail.subject,
    body: mail.body,
    status: mail.status,
    isRead: mail.isRead,
    receivedAt: mail.receivedAt.toISOString(),
    folderId: mail.folderId,
    clientName: mail.client?.commercialName ?? mail.client?.legalName ?? null,
    replies: mail.replies.map((r) => ({
      id: r.id,
      body: r.body,
      aiGenerated: r.aiGenerated,
      createdAt: r.createdAt.toISOString(),
      authorName: `${r.author.firstName} ${r.author.lastName}`,
    })),
  }));

  const folderData = folders.map((f) => ({ id: f.id, name: f.name }));

  return <MailClient initialMails={mailData} initialFolders={folderData} />;
}

export const metadata = {
  title: "Mails — TREVYS OS",
};
