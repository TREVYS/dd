"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

type FolderOption = { id: string; name: string; level: number };

export function UploadDocumentButton({
  clientId,
  folders,
  defaultFolderId,
}: {
  clientId: string;
  folders: FolderOption[];
  defaultFolderId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    folderId: defaultFolderId ?? folders[0]?.id ?? "",
  });

  useEffect(() => {
    setForm((f) => ({ ...f, folderId: defaultFolderId ?? folders[0]?.id ?? "" }));
  }, [defaultFolderId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        folderId: form.folderId || undefined,
        name: form.name,
        fileUrl: `/uploads/${encodeURIComponent(form.name)}`,
      }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ ...form, name: "" });
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
      >
        <Upload size={16} />
        Déposer un document
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Déposer un document</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                required
                value={form.folderId}
                onChange={(e) => setForm({ ...form, folderId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {"—".repeat(f.level - 1)} {f.name}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Nom du document"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Déposer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
