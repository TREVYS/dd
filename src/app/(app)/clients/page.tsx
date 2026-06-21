import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NewClientButton } from "./new-client-button";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { legalName: "asc" },
    include: { assignedCollaborator: true, assignedManager: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <NewClientButton />
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">Raison sociale</th>
              <th className="py-3 px-5">SIREN</th>
              <th className="py-3 px-5">Régime fiscal</th>
              <th className="py-3 px-5">Manager</th>
              <th className="py-3 px-5">Collaborateur</th>
              <th className="py-3 px-5">Statut</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-5">
                  <Link href={`/clients/${c.id}`} className="font-medium hover:text-brand">
                    {c.commercialName || c.legalName}
                  </Link>
                </td>
                <td className="py-3 px-5 text-gray-500">{c.siren ?? "—"}</td>
                <td className="py-3 px-5 text-gray-500">{c.taxRegime ?? "—"}</td>
                <td className="py-3 px-5 text-gray-500">
                  {c.assignedManager
                    ? `${c.assignedManager.firstName} ${c.assignedManager.lastName}`
                    : "—"}
                </td>
                <td className="py-3 px-5 text-gray-500">
                  {c.assignedCollaborator
                    ? `${c.assignedCollaborator.firstName} ${c.assignedCollaborator.lastName}`
                    : "—"}
                </td>
                <td className="py-3 px-5">
                  <span className="rounded-full bg-green-50 text-green-600 text-xs font-medium px-3 py-1">
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  Aucun client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
