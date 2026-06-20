"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

export function NewExerciceButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const year = window.prompt("Année de l'exercice à créer :", String(new Date().getFullYear() + 1));
    if (!year) return;
    setLoading(true);
    await fetch(`/api/clients/${clientId}/exercices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: Number(year) }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand disabled:opacity-50"
    >
      <CalendarPlus size={15} />
      {loading ? "Création..." : "Nouvel exercice"}
    </button>
  );
}
