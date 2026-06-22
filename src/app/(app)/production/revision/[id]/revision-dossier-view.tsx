"use client";

import { useEffect, useState } from "react";
import { Lock, Upload, CheckCircle2, XCircle, Send } from "lucide-react";

type Cycle = {
  id: string;
  code: string;
  label: string;
  orderIndex: number;
  accountPrefixes: string[];
  isApplicable: boolean;
  objectives: string | null;
  commentCollaborator: string | null;
  conclusionCollaborator: string | null;
  status: string;
  submittedAt: string | null;
  validatedByManager: { firstName: string; lastName: string } | null;
  validatedByPartner: { firstName: string; lastName: string } | null;
  _count: { comments: number; attachments: number };
};

type Dossier = {
  id: string;
  fiscalYear: number;
  status: string;
  materialityBasis: string | null;
  materialityThreshold: number | null;
  synthesisNote: unknown;
  lockedAt: string | null;
  client: { id: string; legalName: string };
  fecImport: { id: string; fileName: string; fileUrl: string } | null;
  cycles: Cycle[];
};

type FecImportOption = { id: string; fileName: string; fiscalYear: number };

const STATUS_STYLES: Record<string, string> = {
  non_commence: "bg-gray-100 text-gray-500",
  en_cours: "bg-blue-100 text-blue-700",
  a_completer: "bg-amber-100 text-amber-700",
  soumis_revue: "bg-purple-100 text-purple-700",
  valide: "bg-emerald-100 text-emerald-700",
  invalide: "bg-red-100 text-red-700",
  non_applicable: "bg-gray-50 text-gray-300",
};

const STATUS_LABELS: Record<string, string> = {
  non_commence: "Non commencé",
  en_cours: "En cours",
  a_completer: "À compléter",
  soumis_revue: "Soumis à revue",
  valide: "Validé",
  invalide: "Invalidé",
  non_applicable: "Non applicable",
};

export function RevisionDossierView({ dossierId, role }: { dossierId: string; role: string | null }) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [fecOptions, setFecOptions] = useState<FecImportOption[]>([]);
  const [comment, setComment] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [saving, setSaving] = useState(false);

  const canManager = role === "Manager" || role === "Associé" || role === "Administrateur";
  const canPartner = role === "Associé" || role === "Administrateur";

  async function load() {
    const d = await fetch(`/api/revision/dossiers/${dossierId}`).then((r) => r.json());
    setDossier(d);
    if (selectedCycle) {
      const refreshed = d.cycles.find((c: Cycle) => c.id === selectedCycle.id);
      setSelectedCycle(refreshed ?? null);
      setComment(refreshed?.commentCollaborator ?? "");
      setConclusion(refreshed?.conclusionCollaborator ?? "");
    }
  }

  useEffect(() => {
    load();
  }, [dossierId]);

  useEffect(() => {
    if (!dossier) return;
    fetch(`/api/fec/imports?clientId=${dossier.client.id}`)
      .then((r) => r.json())
      .then(setFecOptions);
  }, [dossier?.client.id]);

  function openCycle(c: Cycle) {
    setSelectedCycle(c);
    setComment(c.commentCollaborator ?? "");
    setConclusion(c.conclusionCollaborator ?? "");
  }

  async function linkFecImport(fecImportId: string) {
    await fetch(`/api/revision/dossiers/${dossierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecImportId }),
    });
    load();
  }

  async function saveCycle() {
    if (!selectedCycle) return;
    setSaving(true);
    await fetch(`/api/revision/cycles/${selectedCycle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentCollaborator: comment, conclusionCollaborator: conclusion, status: "en_cours" }),
    });
    setSaving(false);
    load();
  }

  async function submitCycle() {
    if (!selectedCycle) return;
    await saveCycle();
    await fetch(`/api/revision/cycles/${selectedCycle.id}/submit`, { method: "POST" });
    load();
  }

  async function validateCycle(decision: "valide" | "invalide", level: "manager" | "associe") {
    if (!selectedCycle) return;
    await fetch(`/api/revision/cycles/${selectedCycle.id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, level }),
    });
    load();
  }

  async function uploadAttachment(file: File) {
    if (!selectedCycle) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/revision/cycles/${selectedCycle.id}/attachments`, { method: "POST", body: formData });
    load();
  }

  async function lockDossier() {
    const res = await fetch(`/api/revision/dossiers/${dossierId}/lock`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.blockers ? data.blockers.join("\n") : "Clôture impossible.");
      return;
    }
    load();
  }

  if (!dossier) return <div className="text-sm text-gray-400">Chargement…</div>;

  const applicable = dossier.cycles.filter((c) => c.isApplicable);
  const validated = applicable.filter((c) => c.status === "valide").length;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{dossier.client.legalName} — exercice {dossier.fiscalYear}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {validated} / {applicable.length} cycles validés
            {dossier.lockedAt && " · Dossier verrouillé"}
          </p>
        </div>
        {canPartner && !dossier.lockedAt && (
          <button
            onClick={lockDossier}
            className="flex items-center gap-2 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Lock size={16} />
            Clôturer le dossier
          </button>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <p className="text-sm font-medium mb-2">Fichier FEC lié</p>
        {dossier.fecImport ? (
          <p className="text-sm text-gray-600">{dossier.fecImport.fileName}</p>
        ) : (
          <select
            onChange={(e) => e.target.value && linkFecImport(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Sélectionner un import FEC existant</option>
            {fecOptions.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fileName} ({f.fiscalYear})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dossier.cycles.map((c) => (
          <button
            key={c.id}
            onClick={() => openCycle(c)}
            className={`text-left rounded-2xl p-4 border transition ${
              selectedCycle?.id === c.id ? "border-brand" : "border-gray-100"
            } glass-panel`}
          >
            <p className="font-medium text-sm">{c.label}</p>
            <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] ?? "bg-gray-100 text-gray-500"}`}>
              {STATUS_LABELS[c.status] ?? c.status}
            </span>
          </button>
        ))}
      </div>

      {selectedCycle && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selectedCycle.label}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[selectedCycle.status] ?? "bg-gray-100"}`}>
              {STATUS_LABELS[selectedCycle.status] ?? selectedCycle.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{selectedCycle.objectives}</p>
          <p className="text-xs text-gray-400">
            Comptes : {selectedCycle.accountPrefixes.join(", ") || "—"}
          </p>

          <div>
            <label className="text-xs font-medium text-gray-500">Commentaire collaborateur</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!!dossier.lockedAt}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Conclusion collaborateur</label>
            <textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              disabled={!!dossier.lockedAt}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mt-1"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 flex items-center gap-2">
              <Upload size={14} />
              Pièce justificative
            </label>
            <input
              type="file"
              disabled={!!dossier.lockedAt}
              onChange={(e) => e.target.files?.[0] && uploadAttachment(e.target.files[0])}
              className="text-sm mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">{selectedCycle._count.attachments} pièce(s) jointe(s)</p>
          </div>

          {!dossier.lockedAt && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={saveCycle}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 disabled:opacity-50"
              >
                Enregistrer
              </button>
              <button
                onClick={submitCycle}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-brand text-white"
              >
                <Send size={14} />
                Soumettre au manager
              </button>
              {canManager && (
                <>
                  <button
                    onClick={() => validateCycle("valide", "manager")}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-emerald-600 text-white"
                  >
                    <CheckCircle2 size={14} />
                    Valider (manager)
                  </button>
                  <button
                    onClick={() => validateCycle("invalide", "manager")}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-600 text-white"
                  >
                    <XCircle size={14} />
                    Invalider (manager)
                  </button>
                </>
              )}
              {canPartner && (
                <>
                  <button
                    onClick={() => validateCycle("valide", "associe")}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-emerald-800 text-white"
                  >
                    <CheckCircle2 size={14} />
                    Valider (associé)
                  </button>
                  <button
                    onClick={() => validateCycle("invalide", "associe")}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-800 text-white"
                  >
                    <XCircle size={14} />
                    Invalider (associé)
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
