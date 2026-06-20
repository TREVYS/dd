"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

const CATEGORIES = [
  { value: "fiscalite", label: "Fiscalité" },
  { value: "attention", label: "Point d'attention" },
  { value: "objectif", label: "Objectif du mois" },
  { value: "info", label: "Information" },
];

export function NewAnnouncementButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "info",
    title: "",
    content: "",
    endsAt: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setOpen(false);
    setForm({ category: "info", title: "", content: "", endsAt: "" });
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white"
      >
        <Megaphone size={16} />
        Publier une actualité
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-gray-900">
            <h2 className="text-lg font-semibold mb-4">Nouvelle actualité</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Titre"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Message"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <div>
                <label className="text-xs text-gray-500">Visible jusqu&apos;au (optionnel)</label>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Publication..." : "Publier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
