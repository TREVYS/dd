"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ClipboardCheck } from "lucide-react";

type Client = { id: string; legalName: string };
type DossierItem = {
  id: string;
  fiscalYear: number;
  status: string;
  client: { id: string; legalName: string };
  createdBy: { firstName: string; lastName: string } | null;
  _count: { cycles: number };
};

const STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  soumis: "Soumis",
  cloture: "Clôturé",
};

const TYPOLOGIES = [
  "BNC",
  "TPE",
  "PME",
  "holding",
  "SCI",
  "filiale_groupe",
  "association",
  "commerce",
  "prestations_services",
  "immobilier",
  "restauration",
  "profession_liberale",
];

const initialForm = {
  clientId: "",
  fiscalYear: new Date().getFullYear(),
  sectorActivity: "",
  clientTypology: "",
  taxRegime: "",
  vatRegime: "",
  hasEmployees: false,
  hasStocks: false,
  hasLoans: false,
  hasFixedAssets: false,
  hasCurrentAccounts: false,
  hasTaxGroup: false,
  riskLevel: "normal" as "faible" | "normal" | "eleve",
};

export function RevisionListView() {
  const router = useRouter();
  const [dossiers, setDossiers] = useState<DossierItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [d, c] = await Promise.all([
      fetch("/api/revision/dossiers").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ]);
    setDossiers(d);
    setClients(c);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/revision/dossiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const created = await res.json();
      router.push(`/production/revision/${created.id}`);
    }
  }

  const flagFields: { key: keyof typeof initialForm; label: string }[] = [
    { key: "hasEmployees", label: "Salariés" },
    { key: "hasStocks", label: "Stocks" },
    { key: "hasLoans", label: "Emprunts" },
    { key: "hasFixedAssets", label: "Immobilisations" },
    { key: "hasCurrentAccounts", label: "Comptes courants associés" },
    { key: "hasTaxGroup", label: "Intégration fiscale" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-dark"
        >
          <Plus size={16} />
          Nouveau dossier
        </button>
      </div>

      <div className="space-y-3">
        {dossiers.map((d) => (
          <button
            key={d.id}
            onClick={() => router.push(`/production/revision/${d.id}`)}
            className="w-full glass-panel rounded-2xl p-5 flex items-center justify-between text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <p className="font-medium">{d.client.legalName} — exercice {d.fiscalYear}</p>
                <p className="text-xs text-gray-500">
                  {d._count.cycles} cycle(s) · {d.createdBy ? `${d.createdBy.firstName} ${d.createdBy.lastName}` : "—"}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              {STATUS_LABELS[d.status] ?? d.status}
            </span>
          </button>
        ))}
        {dossiers.length === 0 && (
          <div className="glass-panel rounded-2xl p-8 text-center text-gray-400 text-sm">
            Aucun dossier de révision pour le moment.
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Nouveau dossier de révision</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Sélectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.legalName}
                  </option>
                ))}
              </select>
              <input
                type="number"
                required
                placeholder="Exercice (ex: 2025)"
                value={form.fiscalYear}
                onChange={(e) => setForm({ ...form, fiscalYear: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <input
                placeholder="Secteur d'activité"
                value={form.sectorActivity}
                onChange={(e) => setForm({ ...form, sectorActivity: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <select
                value={form.clientTypology}
                onChange={(e) => setForm({ ...form, clientTypology: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Typologie client</option>
                {TYPOLOGIES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Régime fiscal"
                  value={form.taxRegime}
                  onChange={(e) => setForm({ ...form, taxRegime: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
                <input
                  placeholder="Régime TVA"
                  value={form.vatRegime}
                  onChange={(e) => setForm({ ...form, vatRegime: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {flagFields.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={form[f.key] as boolean}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
              <select
                value={form.riskLevel}
                onChange={(e) => setForm({ ...form, riskLevel: e.target.value as typeof form.riskLevel })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="faible">Risque faible</option>
                <option value="normal">Risque normal</option>
                <option value="eleve">Risque élevé</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm text-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Créer le dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
