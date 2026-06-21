"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { LEGAL_FORMS, TYPE_LABELS, type LegalCaseType } from "@/lib/legal-cases";

type Client = { id: string; name: string };

export function NewLegalCaseButton({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientId: clients[0]?.id ?? "",
    type: "depot_comptes" as LegalCaseType,
    title: "",
    legalForm: LEGAL_FORMS[0] as string,
    fiscalYear: new Date().getFullYear(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const title =
      form.title.trim() ||
      (form.type === "depot_comptes"
        ? `Dépôt des comptes ${form.fiscalYear}`
        : form.type === "creation_societe"
          ? `Création de société (${form.legalForm})`
          : "Formalité juridique");

    await fetch("/api/legal-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: form.clientId,
        type: form.type,
        title,
        legalForm: form.type === "creation_societe" ? form.legalForm : undefined,
        fiscalYear: form.type === "depot_comptes" ? form.fiscalYear : undefined,
      }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ ...form, title: "" });
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
      >
        <Plus size={16} />
        Nouveau dossier
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Nouveau dossier juridique</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as LegalCaseType })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {form.type === "creation_societe" && (
                <select
                  value={form.legalForm}
                  onChange={(e) => setForm({ ...form, legalForm: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  {LEGAL_FORMS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              )}

              {form.type === "depot_comptes" && (
                <input
                  type="number"
                  value={form.fiscalYear}
                  onChange={(e) => setForm({ ...form, fiscalYear: Number(e.target.value) })}
                  placeholder="Exercice (année)"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
              )}

              <input
                placeholder="Titre du dossier (optionnel)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                  {loading ? "Création..." : "Créer le dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
