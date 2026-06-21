"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, Loader2 } from "lucide-react";

type FolderOption = { id: string; name: string; level: number };

type Suggestion = {
  documentType: string;
  category: string;
  fiscalYear: number | null;
  folderId: string | null;
  folderLabel: string | null;
  reasoning: string;
  source: "ai" | "heuristic";
};

type AnalyzeResult = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string | null;
  ocrText: string | null;
  suggestion: Suggestion;
};

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
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [form, setForm] = useState({
    name: "",
    documentType: "",
    category: "",
    fiscalYear: "" as string | number,
    folderId: defaultFolderId ?? folders[0]?.id ?? "",
  });

  async function analyzeFile(file: File) {
    setError(null);
    setAnalyzing(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("clientId", clientId);
      const res = await fetch("/api/documents/analyze", { method: "POST", body: fd });
      if (!res.ok) throw new Error("analyse échouée");
      const data: AnalyzeResult = await res.json();
      setResult(data);
      setForm({
        name: data.fileName,
        documentType: data.suggestion.documentType,
        category: data.suggestion.category,
        fiscalYear: data.suggestion.fiscalYear ?? "",
        folderId: data.suggestion.folderId ?? defaultFolderId ?? folders[0]?.id ?? "",
      });
    } catch {
      setError("Impossible d'analyser ce document. Vous pouvez réessayer.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) analyzeFile(file);
  }

  async function handleConfirm() {
    if (!result) return;
    setSaving(true);
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        folderId: form.folderId || undefined,
        name: form.name,
        documentType: form.documentType || undefined,
        category: form.category || undefined,
        fiscalYear: form.fiscalYear || undefined,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
        mimeType: result.mimeType ?? undefined,
        ocrText: result.ocrText ?? undefined,
        aiSummary: result.suggestion.reasoning,
        source: result.suggestion.source === "ai" ? "ai_ocr" : "ocr",
      }),
    });
    setSaving(false);
    closeAndReset();
    router.refresh();
  }

  function closeAndReset() {
    setOpen(false);
    setResult(null);
    setError(null);
    setForm({ name: "", documentType: "", category: "", fiscalYear: "", folderId: defaultFolderId ?? folders[0]?.id ?? "" });
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Déposer un document</h2>

            {!result && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                  dragOver ? "border-brand bg-brand/5" : "border-gray-200"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) analyzeFile(file);
                  }}
                />
                {analyzing ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={24} className="animate-spin text-brand" />
                    Lecture OCR et analyse IA en cours...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                    <Upload size={24} className="text-gray-400" />
                    Glissez-déposez un fichier ici, ou cliquez pour parcourir
                  </div>
                )}
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-brand/5 rounded-xl p-3 text-sm">
                  <Sparkles size={16} className="text-brand shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-brand">
                      {result.suggestion.source === "ai" ? "Classement proposé par l'IA" : "Classement suggéré"}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">{result.suggestion.reasoning}</p>
                  </div>
                </div>

                <input
                  placeholder="Nom du document"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Type de document"
                    value={form.documentType}
                    onChange={(e) => setForm({ ...form, documentType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Exercice (année)"
                    type="number"
                    value={form.fiscalYear}
                    onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <select
                  value={form.folderId}
                  onChange={(e) => setForm({ ...form, folderId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Sans dossier</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {"—".repeat(f.level - 1)} {f.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeAndReset} className="px-4 py-2 text-sm text-gray-500">
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={saving}
                    className="bg-brand text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? "Enregistrement..." : "Valider le classement"}
                  </button>
                </div>
              </div>
            )}

            {!result && !analyzing && (
              <div className="flex justify-end pt-4">
                <button type="button" onClick={closeAndReset} className="px-4 py-2 text-sm text-gray-500">
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
