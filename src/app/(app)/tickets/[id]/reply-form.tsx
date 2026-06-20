"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await fetch(`/api/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setMessage("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Répondre au ticket..."
        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-brand text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        Envoyer
      </button>
    </form>
  );
}
