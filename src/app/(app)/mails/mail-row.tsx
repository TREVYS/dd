"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail as MailIcon, MailOpen, CheckCircle2 } from "lucide-react";

type MailData = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
  status: string;
  isRead: boolean;
  receivedAt: string;
  clientName: string | null;
};

export function MailRow({ mail }: { mail: MailData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function patch(data: Partial<{ isRead: boolean; status: string }>) {
    setLoading(true);
    await fetch(`/api/mails/${mail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleOpen() {
    setOpen((o) => !o);
    if (!mail.isRead) {
      await patch({ isRead: true });
    }
  }

  const isTreated = mail.status === "traite";

  return (
    <div className="p-4">
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 text-left"
      >
        {mail.isRead ? (
          <MailOpen size={18} className="text-gray-300 shrink-0" />
        ) : (
          <MailIcon size={18} className="text-brand shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-sm truncate ${mail.isRead ? "text-gray-500" : "font-semibold"}`}>
            {mail.subject}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {mail.fromName} · {mail.fromEmail}
            {mail.clientName ? ` · ${mail.clientName}` : ""}
          </p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">
          {new Date(mail.receivedAt).toLocaleDateString("fr-FR")}
        </span>
        {isTreated ? (
          <span className="rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 shrink-0">
            Traité
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 text-amber-600 text-xs font-medium px-3 py-1 shrink-0">
            À traiter
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 ml-9 space-y-3">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{mail.body}</p>
          {!isTreated && (
            <button
              onClick={() => patch({ status: "traite" })}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-brand font-medium disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              Marquer comme traité
            </button>
          )}
        </div>
      )}
    </div>
  );
}
