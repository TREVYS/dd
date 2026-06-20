import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MailRow } from "./mail-row";

export default async function MailsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const mails = userId
    ? await prisma.mail.findMany({
        where: { recipientId: userId },
        orderBy: { receivedAt: "desc" },
        include: { client: true },
      })
    : [];

  const toTreat = mails.filter((m) => m.status === "a_traiter").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Mails</h1>
        <p className="text-sm text-gray-500">
          {toTreat > 0
            ? `${toTreat} mail${toTreat > 1 ? "s" : ""} à traiter`
            : "Tout est traité"}
        </p>
      </div>

      <div className="bg-white rounded-2xl divide-y divide-gray-50">
        {mails.length === 0 && (
          <p className="p-6 text-gray-400 text-sm">Aucun mail.</p>
        )}
        {mails.map((mail) => (
          <MailRow
            key={mail.id}
            mail={{
              id: mail.id,
              fromName: mail.fromName,
              fromEmail: mail.fromEmail,
              subject: mail.subject,
              body: mail.body,
              status: mail.status,
              isRead: mail.isRead,
              receivedAt: mail.receivedAt.toISOString(),
              clientName: mail.client?.commercialName ?? mail.client?.legalName ?? null,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Mails — TREVYS OS",
};
