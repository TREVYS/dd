"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Client = { id: string; legalName: string };

type Anomaly = {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
};

type MonthlyPoint = { month: string; value: number };

type Metrics = {
  fiscalYear: number;
  lineCount: number;
  journalCount: number;
  totals: Record<string, number>;
  ratios: Record<string, number | null>;
  monthlyCA: MonthlyPoint[];
  monthlyCharges: MonthlyPoint[];
  topClients: { compte: string; libelle: string; montant: number }[];
  topFournisseurs: { compte: string; libelle: string; montant: number }[];
  comptesCourantsAssocies: { compte: string; libelle: string; solde: number }[];
  comptesAttente: { compte: string; libelle: string; solde: number }[];
};

type FecImportSummary = {
  id: string;
  fiscalYear: number;
  fileName: string;
  createdAt: string;
  client: { id: string; legalName: string };
  _count: { anomalies: number; reports: number };
};

type FecImportDetail = {
  id: string;
  fiscalYear: number;
  fileName: string;
  metrics: Metrics;
  anomalies: Anomaly[];
  reports: ReportItem[];
  chatLogs: { id: string; role: string; content: string }[];
};

type ReportItem = {
  id: string;
  title: string;
  type: string;
  tone: string;
  status: string;
  shareToken: string | null;
  shareExpiresAt: string | null;
  content: { summary: string; sections: { title: string; body: string }[] };
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

const REPORT_TYPES = [
  { value: "synthese_dirigeant", label: "Synthèse dirigeant" },
  { value: "rapport_gestion", label: "Rapport de gestion" },
  { value: "analyse_marges", label: "Analyse des marges" },
  { value: "analyse_tresorerie", label: "Analyse de trésorerie" },
  { value: "rapport_banque", label: "Rapport banque" },
  { value: "rapport_investisseur", label: "Rapport investisseur" },
];

const TONES = [
  { value: "dirigeant", label: "Dirigeant" },
  { value: "synthetique", label: "Synthétique" },
  { value: "pedagogique", label: "Pédagogique" },
  { value: "expert", label: "Expert" },
];

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

export function FecAnalyseView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [imports, setImports] = useState<FecImportSummary[]>([]);
  const [selectedImport, setSelectedImport] = useState<FecImportDetail | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [reportType, setReportType] = useState(REPORT_TYPES[0].value);
  const [reportTone, setReportTone] = useState(TONES[0].value);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [shareInfo, setShareInfo] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setImports([]);
      return;
    }
    fetch(`/api/fec/imports?clientId=${selectedClientId}`)
      .then((r) => r.json())
      .then(setImports)
      .catch(() => setImports([]));
  }, [selectedClientId]);

  async function loadImport(id: string) {
    const res = await fetch(`/api/fec/imports/${id}`);
    if (res.ok) {
      setSelectedImport(await res.json());
      setShareInfo(null);
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    if (!selectedClientId || !fileInput.files?.[0]) {
      setUploadError("Sélectionnez un client et un fichier FEC.");
      return;
    }

    const fd = new FormData();
    fd.append("clientId", selectedClientId);
    fd.append("file", fileInput.files[0]);

    setUploading(true);
    try {
      const res = await fetch("/api/fec/imports", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.message ?? data.error ?? "Erreur à l'import.");
        return;
      }
      form.reset();
      const list = await fetch(`/api/fec/imports?clientId=${selectedClientId}`).then((r) => r.json());
      setImports(list);
      loadImport(data.id);
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk() {
    if (!selectedImport || !chatQuestion.trim()) return;
    setChatLoading(true);
    const question = chatQuestion;
    setChatQuestion("");
    setSelectedImport({
      ...selectedImport,
      chatLogs: [...selectedImport.chatLogs, { id: "tmp-q", role: "user", content: question }],
    });
    try {
      const res = await fetch(`/api/fec/imports/${selectedImport.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setSelectedImport((prev) =>
        prev
          ? {
              ...prev,
              chatLogs: [...prev.chatLogs, { id: "tmp-a", role: "assistant", content: data.answer ?? "" }],
            }
          : prev
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function handleGenerateReport() {
    if (!selectedImport) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/fec/imports/${selectedImport.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, tone: reportTone }),
      });
      const report = await res.json();
      setSelectedImport((prev) => (prev ? { ...prev, reports: [report, ...prev.reports] } : prev));
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleShare(reportId: string) {
    const res = await fetch(`/api/fec/reports/${reportId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresInDays: 30 }),
    });
    const data = await res.json();
    setShareInfo({ id: reportId, url: data.url });
  }

  const metrics = selectedImport?.metrics;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold">1. Sélection du client &amp; import du FEC</h2>
        <select
          className="border rounded-lg px-3 py-2 w-full max-w-md"
          value={selectedClientId}
          onChange={(e) => {
            setSelectedClientId(e.target.value);
            setSelectedImport(null);
          }}
        >
          <option value="">— Sélectionner un client —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.legalName}
            </option>
          ))}
        </select>

        {selectedClientId && (
          <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3">
            <input type="file" name="file" accept=".txt,.csv" className="text-sm" />
            <button
              type="submit"
              disabled={uploading}
              className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {uploading ? "Analyse en cours..." : "Importer & analyser"}
            </button>
            {uploadError && <span className="text-red-600 text-sm">{uploadError}</span>}
          </form>
        )}

        {imports.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {imports.map((imp) => (
              <button
                key={imp.id}
                onClick={() => loadImport(imp.id)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  selectedImport?.id === imp.id ? "bg-brand text-white border-brand" : "bg-white/60 border-gray-200"
                }`}
              >
                Exercice {imp.fiscalYear} · {imp.fileName} · {imp._count.anomalies} anomalie(s)
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedImport && metrics && (
        <>
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold">2. Indicateurs clés — exercice {metrics.fiscalYear}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Chiffre d'affaires", metrics.totals.chiffreAffaires],
                ["Valeur ajoutée", metrics.totals.valeurAjoutee],
                ["EBE", metrics.totals.ebe],
                ["Résultat net", metrics.totals.resultatNet],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-white/70 rounded-xl p-3">
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="text-lg font-semibold">{fmt(value as number)}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>Taux de VA : {metrics.ratios.tauxValeurAjoutee ?? "—"}%</div>
              <div>Taux d&apos;EBE : {metrics.ratios.tauxEbe ?? "—"}%</div>
              <div>Taux de résultat net : {metrics.ratios.tauxResultatNet ?? "—"}%</div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="text-sm font-medium mb-2">Chiffre d&apos;affaires mensuel</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.monthlyCA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7C3AED" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Charges mensuelles</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={metrics.monthlyCharges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#B978FF" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="font-medium mb-1">Top clients (comptes 411)</div>
                {metrics.topClients.slice(0, 5).map((c) => (
                  <div key={c.compte} className="flex justify-between border-b border-gray-100 py-1">
                    <span>{c.libelle || c.compte}</span>
                    <span>{fmt(c.montant)}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium mb-1">Top fournisseurs (comptes 401)</div>
                {metrics.topFournisseurs.slice(0, 5).map((f) => (
                  <div key={f.compte} className="flex justify-between border-b border-gray-100 py-1">
                    <span>{f.libelle || f.compte}</span>
                    <span>{fmt(f.montant)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold">3. Contrôles automatiques ({selectedImport.anomalies.length} anomalie(s))</h2>
            <div className="space-y-2">
              {selectedImport.anomalies.map((a) => (
                <div key={a.id} className={`border rounded-lg px-3 py-2 text-sm ${SEVERITY_STYLES[a.severity]}`}>
                  {a.message}
                </div>
              ))}
              {selectedImport.anomalies.length === 0 && (
                <div className="text-sm text-gray-500">Aucune anomalie détectée.</div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold">4. Chat analyste financier IA</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto bg-white/50 rounded-lg p-3">
              {selectedImport.chatLogs.length === 0 && (
                <div className="text-sm text-gray-500">
                  Posez une question : « analyse-moi ce FEC », « quels sont les principaux postes de charges ? »,
                  « prépare une synthèse dirigeant »...
                </div>
              )}
              {selectedImport.chatLogs.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap ${
                    m.role === "user" ? "bg-brand text-white ml-auto" : "bg-white border border-gray-100"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {chatLoading && <div className="text-sm text-gray-400">L&apos;analyste IA réfléchit...</div>}
            </div>
            <div className="flex gap-2">
              <input
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Posez votre question..."
                className="border rounded-lg px-3 py-2 flex-1 text-sm"
              />
              <button
                onClick={handleAsk}
                disabled={chatLoading}
                className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold">5. Génération de rapport</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select value={reportTone} onChange={(e) => setReportTone(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {generatingReport ? "Génération..." : "Générer le rapport"}
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {selectedImport.reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-xl p-4 space-y-2 bg-white/60">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-xs text-gray-500">Statut : {report.status}</div>
                    </div>
                    <button
                      onClick={() => handleShare(report.id)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg"
                    >
                      Partager au client
                    </button>
                  </div>
                  <p className="text-sm">{report.content?.summary}</p>
                  {report.content?.sections?.map((s, i) => (
                    <div key={i} className="text-sm">
                      <div className="font-medium">{s.title}</div>
                      <p className="text-gray-600 whitespace-pre-wrap">{s.body}</p>
                    </div>
                  ))}
                  {shareInfo?.id === report.id && (
                    <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-3 py-2">
                      Lien sécurisé généré : <span className="font-mono">{shareInfo.url}</span> (valable 30 jours)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
