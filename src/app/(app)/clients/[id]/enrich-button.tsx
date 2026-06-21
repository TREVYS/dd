"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

export function EnrichButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function enrich() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/clients/${clientId}/enrich`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Erreur lors de l'enrichissement.");
    } else {
      setMessage(
        data.contactsAdded > 0
          ? `Données mises à jour, ${data.contactsAdded} contact(s) ajouté(s).`
          : "Données mises à jour."
      );
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={enrich}
        disabled={busy}
        className="flex items-center gap-1.5 text-xs font-medium bg-brand/10 text-brand rounded-full px-3 py-1.5 disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        Enrichir via API (Sirene / Pappers)
      </button>
      {message && <span className="text-xs text-gray-400">{message}</span>}
    </div>
  );
}
