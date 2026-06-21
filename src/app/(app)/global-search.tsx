"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, User } from "lucide-react";

type Result = { id: string; label: string; sub: string };
type ContactResult = Result & { clientId: string };

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Result[]>([]);
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setClients([]);
      setContacts([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setClients(data.clients ?? []);
      setContacts(data.contacts ?? []);
      setOpen(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function goToClient(id: string) {
    setOpen(false);
    setQ("");
    router.push(`/clients/${id}`);
  }

  function goToContact(clientId: string, contactId: string) {
    setOpen(false);
    setQ("");
    router.push(`/clients/${clientId}#contact-${contactId}`);
  }

  const hasResults = clients.length > 0 || contacts.length > 0;

  return (
    <div ref={boxRef} className="relative w-80">
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
        <Search size={15} className="text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          placeholder="Rechercher un client ou un contact..."
          className="bg-transparent outline-none text-sm flex-1"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute mt-1 w-full glass-panel rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto z-50">
          {!hasResults && (
            <p className="text-sm text-gray-400 px-4 py-3">Aucun résultat.</p>
          )}
          {clients.length > 0 && (
            <div className="py-1">
              <p className="px-4 py-1 text-[11px] uppercase tracking-wide text-gray-400">Dossiers</p>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToClient(c.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <Building2 size={14} className="text-brand shrink-0" />
                  <span className="truncate">{c.label}</span>
                  {c.sub && <span className="text-gray-400 text-xs ml-auto shrink-0">{c.sub}</span>}
                </button>
              ))}
            </div>
          )}
          {contacts.length > 0 && (
            <div className="py-1 border-t border-gray-50">
              <p className="px-4 py-1 text-[11px] uppercase tracking-wide text-gray-400">Contacts</p>
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToContact(c.clientId, c.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <User size={14} className="text-brand shrink-0" />
                  <span className="truncate">{c.label}</span>
                  <span className="text-gray-400 text-xs ml-auto shrink-0">{c.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
