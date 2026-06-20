import { prisma } from "@/lib/prisma";
import { UploadDocumentButton } from "./upload-button";

export default async function GedPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; category?: string; year?: string }>;
}) {
  const sp = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { legalName: "asc" } });

  const documents = await prisma.document.findMany({
    where: {
      isDeleted: false,
      clientId: sp.client || undefined,
      category: sp.category || undefined,
      fiscalYear: sp.year ? Number(sp.year) : undefined,
    },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">GED — Gestion documentaire</h1>
        <UploadDocumentButton clients={clients} />
      </div>

      <form className="flex gap-3 bg-white rounded-2xl p-4" method="get">
        <select name="client" defaultValue={sp.client ?? ""} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
          <option value="">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.commercialName || c.legalName}
            </option>
          ))}
        </select>
        <input
          name="category"
          placeholder="Catégorie"
          defaultValue={sp.category ?? ""}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          name="year"
          placeholder="Exercice"
          defaultValue={sp.year ?? ""}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm w-28"
        />
        <button className="bg-black text-white rounded-xl px-4 py-2 text-sm">
          Rechercher
        </button>
      </form>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-3 px-5">Document</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Catégorie</th>
              <th className="py-3 px-5">Exercice</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-5 font-medium">{d.name}</td>
                <td className="py-3 px-5 text-gray-500">{d.client?.legalName ?? "—"}</td>
                <td className="py-3 px-5 text-gray-500">{d.category ?? "—"}</td>
                <td className="py-3 px-5 text-gray-500">{d.fiscalYear ?? "—"}</td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  Aucun document trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
