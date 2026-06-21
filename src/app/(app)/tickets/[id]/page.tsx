import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReplyForm } from "./reply-form";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-gray-400">{ticket.ticketNumber}</p>
        <h1 className="text-2xl font-semibold">{ticket.subject}</h1>
        <p className="text-sm text-gray-500">
          {ticket.client.legalName} — statut : {ticket.status}
        </p>
      </div>

      {ticket.description && (
        <div className="glass-panel rounded-2xl p-5 text-sm">{ticket.description}</div>
      )}

      <div className="space-y-3">
        {ticket.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-2xl p-4 text-sm max-w-md ${
              m.senderType === "client"
                ? "bg-gray-100"
                : "bg-brand/10 ml-auto text-right"
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">{m.senderType}</p>
            <p>{m.message}</p>
          </div>
        ))}
        {ticket.messages.length === 0 && (
          <p className="text-gray-400 text-sm">Aucun message pour le moment.</p>
        )}
      </div>

      <ReplyForm ticketId={ticket.id} />
    </div>
  );
}
