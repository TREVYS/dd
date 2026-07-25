"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Hit = { group: string; label: string; sub?: string; href: string };

// Recherche globale du cockpit : tape 2 lettres, résultats groupés
// (articles, candidats, messages, newsletters…), navigation au clic.
export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Recherche avec un léger délai anti-rafale.
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const d = (await r.json()) as { hits?: Hit[] };
        setHits(d.hits ?? []);
        setOpen(true);
      } catch {
        setHits([]);
      } finally {
        setBusy(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // Fermer au clic extérieur / Échap.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const groups = Array.from(new Set(hits.map((h) => h.group)));

  return (
    <div className="ck-search ck-search-live" ref={boxRef}>
      <svg viewBox="0 0 24 24"><path d="M21 21l-4-4M11 18a7 7 0 100-14 7 7 0 000 14z" /></svg>
      <input
        placeholder="Rechercher partout : articles, candidats, messages…"
        aria-label="Recherche globale"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
      />
      {busy && <span className="ck-search-busy" aria-hidden="true" />}
      {open && (
        <div className="ck-search-drop">
          {hits.length === 0 ? (
            <div className="ck-search-empty">Aucun résultat pour « {q} »</div>
          ) : (
            groups.map((g) => (
              <div key={g}>
                <div className="ck-search-group">{g}</div>
                {hits
                  .filter((h) => h.group === g)
                  .slice(0, 5)
                  .map((h, i) => (
                    <button
                      type="button"
                      className="ck-search-hit"
                      key={`${h.href}-${i}`}
                      onClick={() => {
                        setOpen(false);
                        setQ("");
                        router.push(h.href);
                      }}
                    >
                      <span className="lb">{h.label}</span>
                      {h.sub && <span className="sb">{h.sub}</span>}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
