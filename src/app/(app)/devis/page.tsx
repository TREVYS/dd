import { prisma } from "@/lib/prisma";
import { NewQuoteButton } from "./new-quote-button";

export default async function DevisPage() {
  const [quotes, clients] = await Promise.all([
    prisma.quote.findMany({
      include: { client: true, lines: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { legalName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Devis</h1>
        <NewQuoteButton clients={clients} />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">Client / Prospect</th>
              <th className="py-3 px-5">Lignes</th>
              <th className="py-3 px-5">Honoraires mensuels</th>
              <th className="py-3 px-5">Heures estimées</th>
              <th className="py-3 px-5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-5 font-medium">
                  {q.client?.legalName ?? q.prospectName ?? "—"}
                </td>
                <td className="py-3 px-5 text-gray-500">{q.lines.length}</td>
                <td className="py-3 px-5 text-gray-500">
                  {q.totalMonthlyFee ? `${q.totalMonthlyFee} €` : "—"}
                </td>
                <td className="py-3 px-5 text-gray-500">
                  {q.estimatedHours ? `${q.estimatedHours} h` : "—"}
                </td>
                <td className="py-3 px-5">
                  <span className="rounded-full bg-brand/10 text-brand text-xs font-medium px-3 py-1">
                    {q.status}
                  </span>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Aucun devis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
