import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UploadDocumentButton } from "./upload-button";
import { NewExerciceButton } from "./new-exercice-button";
import { DocumentRow } from "./document-row";
import { FolderTree, type FolderNode } from "./folder-tree";

type FolderRow = {
  id: string;
  parentId: string | null;
  name: string;
  level: number;
};

function buildTree(folders: FolderRow[]): FolderNode[] {
  const byParent = new Map<string | null, FolderRow[]>();
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? [];
    list.push(f);
    byParent.set(f.parentId, list);
  }
  function attach(parentId: string | null): FolderNode[] {
    return (byParent.get(parentId) ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      level: f.level,
      children: attach(f.id),
    }));
  }
  return attach(null);
}

function flattenForUpload(nodes: FolderNode[]): { id: string; name: string; level: number }[] {
  const out: { id: string; name: string; level: number }[] = [];
  function walk(list: FolderNode[]) {
    for (const n of list) {
      out.push({ id: n.id, name: n.name, level: n.level });
      walk(n.children);
    }
  }
  walk(nodes);
  return out;
}

export default async function GedPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; folder?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { legalName: "asc" } });
  const clientId = sp.client || clients[0]?.id || "";

  const folders = clientId
    ? await prisma.documentFolder.findMany({
        where: { clientId, isActive: true },
        orderBy: [{ level: "asc" }, { name: "asc" }],
      })
    : [];

  const tree = buildTree(
    folders.map((f) => ({ id: f.id, parentId: f.parentId, name: f.name, level: f.level }))
  );
  const flatFolders = flattenForUpload(tree);

  const folderMap = new Map(folders.map((f) => [f.id, f.name]));

  const documents = clientId
    ? await prisma.document.findMany({
        where: {
          isDeleted: false,
          clientId,
          folderId: !sp.q && sp.folder ? sp.folder : undefined,
          name: sp.q ? { contains: sp.q, mode: "insensitive" } : undefined,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const selectedFolderName = sp.folder ? folderMap.get(sp.folder) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">GED — Gestion documentaire</h1>
        <div className="flex items-center gap-4">
          {clientId && <NewExerciceButton clientId={clientId} />}
          {clientId && (
            <UploadDocumentButton
              clientId={clientId}
              folders={flatFolders}
              defaultFolderId={sp.folder ?? null}
            />
          )}
        </div>
      </div>

      <form className="flex gap-3 glass-panel rounded-2xl p-4" method="get">
        <select
          name="client"
          defaultValue={clientId}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.commercialName || c.legalName}
            </option>
          ))}
        </select>
        <input
          name="q"
          placeholder="Rechercher un document par nom..."
          defaultValue={sp.q ?? ""}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <button className="bg-black text-white rounded-xl px-4 py-2 text-sm">Rechercher</button>
      </form>

      <div className="flex gap-4">
        <div className="w-72 shrink-0 glass-panel rounded-2xl p-4 overflow-y-auto max-h-[calc(100vh-20rem)]">
          {tree.length === 0 ? (
            <p className="text-sm text-gray-400">
              Aucune arborescence pour ce client. Elle sera créée automatiquement.
            </p>
          ) : (
            <FolderTree tree={tree} clientId={clientId} selectedFolderId={sp.folder ?? null} />
          )}
        </div>

        <div className="flex-1 glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {sp.q
                ? `Résultats pour « ${sp.q} »`
                : selectedFolderName
                  ? selectedFolderName
                  : "Sélectionnez un dossier"}
            </p>
            {sp.folder && !sp.q && (
              <Link href={`/ged?client=${clientId}`} className="text-xs text-brand">
                Voir tout
              </Link>
            )}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-3 px-5">Document</th>
                <th className="py-3 px-5">Dossier</th>
                <th className="py-3 px-5">Exercice</th>
                <th className="py-3 px-5">Ajouté le</th>
                <th className="py-3 px-5" />
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <DocumentRow
                  key={d.id}
                  doc={{
                    id: d.id,
                    name: d.name,
                    category: d.category,
                    fiscalYear: d.fiscalYear,
                    createdAt: d.createdAt.toISOString(),
                    folderName: d.folderId ? folderMap.get(d.folderId) ?? null : null,
                  }}
                />
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Aucun document trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
