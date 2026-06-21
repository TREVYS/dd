"use client";

import { useEffect, useState } from "react";

type SmtpForm = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  pass: string;
};

const EMPTY_FORM: SmtpForm = { host: "", port: 587, secure: false, user: "", from: "", pass: "" };

export function EmailSettingsManager() {
  const [form, setForm] = useState<SmtpForm>(EMPTY_FORM);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/settings/email")
      .then((r) => r.json())
      .then((data) => {
        setConfigured(Boolean(data.configured));
        setForm({
          host: data.host ?? "",
          port: data.port ?? 587,
          secure: Boolean(data.secure),
          user: data.user ?? "",
          from: data.from ?? "",
          pass: "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ message: "Champs manquants ou invalides.", ok: false });
        return;
      }
      setConfigured(true);
      setForm((prev) => ({ ...prev, pass: "" }));
      setFeedback({ message: "Configuration enregistrée.", ok: true });
      void data;
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!testEmail.trim()) return;
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail.trim() }),
      });
      if (res.ok) {
        setFeedback({ message: `E-mail de test envoyé à ${testEmail.trim()}.`, ok: true });
      } else {
        setFeedback({ message: "Échec de l'envoi du mail de test. Vérifiez les paramètres SMTP.", ok: false });
      }
    } finally {
      setTesting(false);
    }
  }

  if (loading) return <div className="text-sm text-gray-500">Chargement...</div>;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Configuration SMTP</h2>
        <span
          className={`text-xs px-2.5 py-1 rounded-full ${
            configured ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {configured ? "Configuré" : "Non configuré"}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        Renseignez les informations de connexion SMTP utilisées pour l&apos;envoi des rapports clients par e-mail
        (module FEC). Ces paramètres sont stockés en base et utilisables sans redémarrage de l&apos;application.
      </p>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Hôte SMTP</span>
            <input
              required
              value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })}
              placeholder="smtp.example.com"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Port</span>
            <input
              required
              type="number"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Utilisateur</span>
            <input
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              placeholder="contact@trevys-advisory.fr"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Mot de passe {configured && "(laisser vide pour conserver)"}</span>
            <input
              type="password"
              value={form.pass}
              onChange={(e) => setForm({ ...form, pass: e.target.value })}
              placeholder={configured ? "••••••••" : ""}
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm space-y-1">
            <span className="text-gray-600">Adresse d&apos;expédition</span>
            <input
              required
              type="email"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
              placeholder="cabinet@trevys-advisory.fr"
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </label>
          <label className="text-sm flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              checked={form.secure}
              onChange={(e) => setForm({ ...form, secure: e.target.checked })}
            />
            <span className="text-gray-600">Connexion sécurisée (SSL/TLS, port 465)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="text-sm font-medium">Tester l&apos;envoi</div>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="votre@email.fr"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px]"
          />
          <button
            onClick={handleTest}
            disabled={testing || !configured}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {testing ? "Envoi..." : "Envoyer un test"}
          </button>
        </div>
      </div>

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
