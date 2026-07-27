"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { movePostAction } from "../reseaux/actions";

export type CalChip = {
  id: string;
  network: "linkedin" | "instagram";
  status: "brouillon" | "planifie" | "publie";
  time?: string;
  snippet: string;
};

// Grille mensuelle interactive : les cartes planifiées se déplacent par
// glisser-déposer d'un jour à l'autre (l'heure est conservée).
export function PlanningCalendar({
  weeks,
  byDay,
  today,
  cur,
  filter,
  selectedId,
  dayHeads,
}: {
  weeks: (string | null)[][];
  byDay: Record<string, CalChip[]>;
  today: string;
  cur: string;
  filter: string;
  selectedId?: string;
  dayHeads: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [over, setOver] = useState<string | null>(null);

  const href = (id: string) => `?m=${cur}${filter ? `&r=${filter}` : ""}&post=${id}#post-detail`;

  function onDrop(day: string, e: React.DragEvent) {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) startTransition(() => movePostAction(id, day));
  }

  return (
    <div className={`pl-grid${pending ? " busy" : ""}`}>
      {dayHeads.map((d) => (
        <div key={d} className="pl-dayhead">{d}</div>
      ))}
      {weeks.flat().map((day, i) =>
        day === null ? (
          <div key={`e${i}`} className="pl-cell off" />
        ) : (
          <div
            key={day}
            className={`pl-cell${day === today ? " today" : ""}${over === day ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(day); }}
            onDragLeave={() => setOver((o) => (o === day ? null : o))}
            onDrop={(e) => onDrop(day, e)}
          >
            <span className="pl-daynum">{Number(day.slice(8))}</span>
            {(byDay[day] ?? []).map((p) => (
              <Link
                key={p.id}
                href={href(p.id)}
                className={`pl-chip ${p.network}${p.status === "publie" ? " done" : ""}${selectedId === p.id ? " sel" : ""}`}
                title={p.status === "publie" ? p.snippet : `${p.snippet} — glissez pour déplacer`}
                draggable={p.status !== "publie"}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
              >
                {p.status === "publie" ? "✓ " : p.time ? `${p.time} ` : ""}
                {p.snippet.slice(0, 34)}
              </Link>
            ))}
          </div>
        ),
      )}
    </div>
  );
}
