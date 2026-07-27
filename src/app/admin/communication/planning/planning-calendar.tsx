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

const MAX_VISIBLE = 3;

// Grille mensuelle interactive : cartes déplaçables par glisser-déposer,
// et jour cliquable — il s'ouvre en grand sous le calendrier (détail coloré
// des posts du jour) et se referme d'un clic.
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
  const [openDay, setOpenDay] = useState<string | null>(null);

  const href = (id: string) => `?m=${cur}${filter ? `&r=${filter}` : ""}&post=${id}#post-detail`;

  function onDrop(day: string, e: React.DragEvent) {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) startTransition(() => movePostAction(id, day));
  }

  const openList = openDay ? byDay[openDay] ?? [] : [];

  return (
    <>
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
              className={`pl-cell${day === today ? " today" : ""}${over === day ? " over" : ""}${openDay === day ? " open" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setOver(day); }}
              onDragLeave={() => setOver((o) => (o === day ? null : o))}
              onDrop={(e) => onDrop(day, e)}
              onClick={() => setOpenDay((o) => (o === day ? null : (byDay[day]?.length ? day : o)))}
              role={byDay[day]?.length ? "button" : undefined}
              title={byDay[day]?.length ? "Cliquer pour ouvrir le détail du jour" : undefined}
            >
              <span className="pl-daynum">{Number(day.slice(8))}</span>
              {(byDay[day] ?? []).slice(0, MAX_VISIBLE).map((p) => (
                <Link
                  key={p.id}
                  href={href(p.id)}
                  onClick={(e) => e.stopPropagation()}
                  className={`pl-chip ${p.network}${p.status === "publie" ? " done" : ""}${selectedId === p.id ? " sel" : ""}`}
                  title={p.status === "publie" ? p.snippet : `${p.snippet} — glissez pour déplacer`}
                  draggable={p.status !== "publie"}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
                >
                  {p.status === "publie" ? "✓ " : p.time ? `${p.time} ` : ""}
                  {p.snippet.slice(0, 34)}
                </Link>
              ))}
              {(byDay[day]?.length ?? 0) > MAX_VISIBLE && (
                <span className="pl-more">+{byDay[day].length - MAX_VISIBLE} — tout voir</span>
              )}
            </div>
          ),
        )}
      </div>

      {/* Détail du jour ouvert — se referme d'un clic */}
      {openDay && (
        <div className="pl-dayopen">
          <div className="pl-dayopen-head">
            <b>
              {new Date(`${openDay}T12:00:00`).toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </b>
            <span className="muted">{openList.length} post{openList.length > 1 ? "s" : ""}</span>
            <button type="button" className="adm-btn ghost sm" onClick={() => setOpenDay(null)}>
              Refermer
            </button>
          </div>
          {openList.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>Rien ce jour-là.</p>
          ) : (
            <div className="pl-dayopen-list">
              {openList.map((p) => (
                <Link key={p.id} href={href(p.id)} className={`pl-dayopen-item ${p.network}`}>
                  <span className="net">{p.network === "linkedin" ? "in" : "IG"}</span>
                  <span className="tm">{p.status === "publie" ? "Publié" : p.time ?? "—"}</span>
                  <span className="tx">{p.snippet}</span>
                  <span className="go">Ouvrir →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
