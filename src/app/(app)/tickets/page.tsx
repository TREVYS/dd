import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewTicketButton } from "./new-ticket-button";

export default async function TicketsPage() {
  const [tickets, clients] = await Promise.all([
    prisma.ticket.findMany({
      include: { client: true, assignee: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { legalName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <NewTicketButton clients={clients} />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">N°</th>
              <th className="py-3 px-5">Sujet</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-5 text-gray-500">{t.ticketNumber}</td>
                <td className="py-3 px-5">
                  <Link href={`/tickets/${t.id}`} className="font-medium hover:text-brand">
                    {t.subject}
                  </Link>
                </td>
                <td className="py-3 px-5 text-gray-500">{t.client.legalName}</td>
                <td className="py-3 px-5">
                  <span className="rounded-full bg-brand/10 text-brand text-xs font-medium px-3 py-1">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  Aucun ticket.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
