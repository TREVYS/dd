"use client";

import { useEffect, useRef, useState } from "react";

type BrandingForm = {
  cabinetName: string;
  logoUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  legalMentions: string;
  signatureName: string;
  signatureTitle: string;
};

const EMPTY_FORM: BrandingForm = {
  cabinetName: "TREVYS",
  logoUrl: null,
  primaryColor: "6D5BF6",
  fontFamily: "Calibri",
  legalMentions: "",
  signatureName: "",
  signatureTitle: "",
};

export function ValuationBrandingManager() {
  const [form, setForm] = useState<BrandingForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetch("/api/settings/valuation-branding")
      .then((r) => r.json())
      .then((data) => setForm({ ...EMPTY_FORM, ...data }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings/valuation-branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setFeedback({ message: "Échec de l'enregistrement.", ok: false });
        return;
      }
      const data = await res.json();
      setForm({ ...EMPTY_FORM, ...data });
      setFeedback({ message: "Personnalisation enregistrée.", ok: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/settings/valuation-branding/logo", { method: "POST", body: fd });
      if (!res.ok) {
        setFeedback({ message: "Échec de l'envoi du logo.", ok: false });
        return;
      }
      const data = await res.json();
      setForm({ ...EMPTY_FORM, ...data });
      setFeedback({ message: "Logo mis à jour.", ok: true });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Chargement...</div>;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 max-w-2xl">
      <p className="text-sm text-gray-500">
        Ces paramètres définissent l&apos;identité visuelle (logo, couleur, police, mentions légales, signature)
        appliquée automatiquement aux rapports Word de valorisation d&apos;entreprise.
      </p>

      <div className="flex items-center gap-4">
        {form.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logoUrl} alt="Logo" className="h-14 w-auto rounded border border-gray-200 bg-white p-1" />
        ) : (
          <div className="h-14 w-24 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
            Aucun logo
          </div>
        )}
        <div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="text-sm" />
          {uploading && <div className="text-xs text-gray-400 mt-1">Envoi en cours...</div>}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Nom du cabinet</span>
            <input
              value={form.cabinetName}
              onChange={(e) => setForm({ ...form, cabinetName: e.target.value })}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Couleur principale</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={`#${form.primaryColor.replace(/^#/, "")}`}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value.replace(/^#/, "") })}
                className="h-9 w-12 border rounded"
              />
              <input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value.replace(/^#/, "") })}
                className="border rounded-lg px-3 py-2 w-full text-sm"
              />
            </div>
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Police</span>
            <input
              value={form.fontFamily}
              onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
              placeholder="Calibri"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Nom du signataire</span>
            <input
              value={form.signatureName}
              onChange={(e) => setForm({ ...form, signatureName: e.target.value })}
              placeholder="Jean Dupont"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Fonction du signataire</span>
            <input
              value={form.signatureTitle}
              onChange={(e) => setForm({ ...form, signatureTitle: e.target.value })}
              placeholder="Associé"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
        </div>
        <label className="text-sm space-y-1 block">
          <span className="text-gray-600">Mentions légales</span>
          <textarea
            value={form.legalMentions}
            onChange={(e) => setForm({ ...form, legalMentions: e.target.value })}
            rows={3}
            placeholder="Cabinet TREVYS - SIRET ... - Document confidentiel..."
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      {feedback && (
        <div
          className={`text-sm rounded-lg px-3 py-2 border ${
            feedback.ok
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
