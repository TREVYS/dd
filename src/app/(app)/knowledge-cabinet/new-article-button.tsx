"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const CATEGORIES = ["Fiscalité", "Comptabilité", "Social", "Juridique", "Procédures internes"];

export function NewArticleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    content: "",
    tags: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setOpen(false);
    setForm({ title: "", category: CATEGORIES[0], content: "", tags: "" });
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
      >
        <Plus size={16} />
        Nouvel article
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Nouvel article</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                required
                placeholder="Contenu de l'article..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <input
                placeholder="Mots-clés (séparés par des virgules)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
                  {loading ? "Création..." : "Créer l'article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export { CATEGORIES };
