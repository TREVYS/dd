"use client";

import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";

type DocumentData = {
  id: string;
  name: string;
  category: string | null;
  fiscalYear: number | null;
  createdAt: string;
  folderName: string | null;
};

export function DocumentRow({ doc }: { doc: DocumentData }) {
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm(`Supprimer « ${doc.name} » ? Cette action peut être annulée par un administrateur.`)) {
      return;
    }
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="py-3 px-5 font-medium flex items-center gap-2">
        <FileText size={15} className="text-gray-400" />
        {doc.name}
      </td>
      <td className="py-3 px-5 text-gray-500">{doc.folderName ?? "—"}</td>
      <td className="py-3 px-5 text-gray-500">{doc.fiscalYear ?? "—"}</td>
      <td className="py-3 px-5 text-gray-500">
        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
      </td>
      <td className="py-3 px-5 text-right">
        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}
