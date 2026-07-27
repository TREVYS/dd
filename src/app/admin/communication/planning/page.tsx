import Link from "next/link";
import { listPosts, type SocialPost } from "@/lib/social-posts";
import { parisToday } from "@/lib/dates";
import { schedulePostAction, deletePostAction, publishPostAction } from "../reseaux/actions";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function ym(d: string): string {
  return d.slice(0, 7);
}

// Grille du mois : semaines complètes du lundi au dimanche.
function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = (first.getUTCDay() + 6) % 7; // lundi = 0
  const daysIn = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(start).fill(null),
    ...Array.from({ length: daysIn }, (_, i) =>
      `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function NetDot({ n }: { n: "linkedin" | "instagram" }) {
  return (
    <span
      className="pl-netdot"
      style={{ background: n === "linkedin" ? "#0A66C2" : "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }}
    >
      {n === "linkedin" ? "in" : "IG"}
    </span>
  );
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; r?: string; post?: string; puberr?: string }>;
}) {
  const sp = await searchParams;
  const today = parisToday();
  const cur = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : ym(today);
  const [year, month] = cur.split("-").map(Number);
  const filter = sp.r === "linkedin" || sp.r === "instagram" ? sp.r : "";

  const prev = new Date(Date.UTC(year, month - 2, 1));
  const next = new Date(Date.UTC(year, month, 1));
  const fmt = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const qs = (m: string) => `?m=${m}${filter ? `&r=${filter}` : ""}`;
  const qsR = (r: string) => `?m=${cur}${r ? `&r=${r}` : ""}`;

  const all = listPosts();
  const posts = filter ? all.filter((p) => p.network === filter) : all;

  // Posts positionnés sur le calendrier : planifiés (à leur date prévue)
  // et publiés (à leur date de publication).
  const byDay = new Map<string, SocialPost[]>();
  for (const p of posts) {
    const day =
      p.status === "planifie"
        ? p.scheduledDate
        : p.status === "publie" && p.publishedAt
          ? p.publishedAt.slice(0, 10)
          : undefined;
    if (!day) continue;
    (byDay.get(day) ?? byDay.set(day, []).get(day)!).push(p);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => (a.scheduledTime ?? "99") < (b.scheduledTime ?? "99") ? -1 : 1);
  }

  const drafts = posts.filter((p) => p.status === "brouillon");
  const selected = sp.post ? all.find((p) => p.id === sp.post) : undefined;
  const weeks = monthGrid(year, month);
  const planned = posts.filter((p) => p.status === "planifie" && p.scheduledDate);

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Planning des publications</h1>
          <p>LinkedIn et Instagram, au jour et à l&apos;heure près. Alfred publie automatiquement à l&apos;heure prévue.</p>
        </div>
      </div>

      {sp.puberr && (
        <div className="adm-note" style={{ marginBottom: "1rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          La publication a échoué — le post reste tel quel. Détail : {sp.puberr}
        </div>
      )}

      {/* Barre d'outils */}
      <div className="pl-toolbar">
        <div className="pl-nav">
          <Link className="adm-btn ghost sm" href={qs(fmt(prev))} aria-label="Mois précédent">‹</Link>
          <span className="pl-month">{MONTHS[month - 1]} {year}</span>
          <Link className="adm-btn ghost sm" href={qs(fmt(next))} aria-label="Mois suivant">›</Link>
          {cur !== ym(today) && <Link className="adm-btn ghost sm" href={qs(ym(today))}>Aujourd&apos;hui</Link>}
        </div>
        <div className="pl-filters">
          <Link className={`ck-chip${filter === "" ? " on" : ""}`} href={qsR("")}>Tous</Link>
          <Link className={`ck-chip pl-in${filter === "linkedin" ? " on" : ""}`} href={qsR("linkedin")}>LinkedIn</Link>
          <Link className={`ck-chip pl-ig${filter === "instagram" ? " on" : ""}`} href={qsR("instagram")}>Instagram</Link>
          <Link className="adm-btn sm" href="/admin/communication/reseaux">+ Nouveau post</Link>
        </div>
      </div>

      {/* Calendrier (PC) */}
      <div className="adm-card pl-calcard">
        <div className="pl-grid">
          {DAYS.map((d) => (
            <div key={d} className="pl-dayhead">{d}</div>
          ))}
          {weeks.flat().map((day, i) =>
            day === null ? (
              <div key={`e${i}`} className="pl-cell off" />
            ) : (
              <div key={day} className={`pl-cell${day === today ? " today" : ""}`}>
                <span className="pl-daynum">{Number(day.slice(8))}</span>
                {(byDay.get(day) ?? []).map((p) => (
                  <Link
                    key={p.id}
                    href={`?m=${cur}${filter ? `&r=${filter}` : ""}&post=${p.id}#post-detail`}
                    className={`pl-chip ${p.network}${p.status === "publie" ? " done" : ""}${selected?.id === p.id ? " sel" : ""}`}
                    title={p.content}
                  >
                    {p.status === "publie" ? "✓ " : p.scheduledTime ? `${p.scheduledTime} ` : ""}
                    {p.content.slice(0, 34)}
                  </Link>
                ))}
              </div>
            ),
          )}
        </div>
        <div className="pl-legend">
          <span><i className="pl-sw" style={{ background: "#0A66C2" }} /> LinkedIn</span>
          <span><i className="pl-sw" style={{ background: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }} /> Instagram</span>
          <span><i className="pl-sw done" /> Publié</span>
        </div>
      </div>

      {/* Liste (mobile) */}
      <div className="adm-card pl-listcard">
        <h2>À venir</h2>
        {planned.length === 0 ? (
          <p className="muted">Aucun post planifié.</p>
        ) : (
          <div className="pl-list">
            {[...planned]
              .sort((a, b) => `${a.scheduledDate}${a.scheduledTime ?? ""}` < `${b.scheduledDate}${b.scheduledTime ?? ""}` ? -1 : 1)
              .map((p) => (
                <Link key={p.id} href={`?post=${p.id}#post-detail`} className="pl-listitem">
                  <NetDot n={p.network} />
                  <span className="d">
                    {new Date(`${p.scheduledDate}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    {p.scheduledTime ? ` · ${p.scheduledTime}` : ""}
                  </span>
                  <span className="t">{p.content.slice(0, 60)}</span>
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Détail / édition du post sélectionné */}
      {selected && (
        <div className="adm-card" id="post-detail" style={{ marginTop: "1.2rem", borderColor: "var(--o)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".6rem" }}>
            <NetDot n={selected.network} />
            <h2 style={{ margin: 0 }}>
              {selected.status === "publie" ? "Post publié" : selected.status === "planifie" ? "Post planifié" : "Brouillon"}
            </h2>
            <Link className="adm-btn ghost sm" href={qs(cur)} style={{ marginLeft: "auto" }}>Fermer</Link>
          </div>
          {selected.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.image} alt="" style={{ maxHeight: 160, borderRadius: 10, border: "1px solid var(--line)", marginBottom: ".6rem" }} />
          )}
          <div className="adm-post-body" style={{ whiteSpace: "pre-wrap" }}>{selected.content}</div>
          {selected.status !== "publie" && (
            <div className="adm-post-actions" style={{ marginTop: ".9rem" }}>
              <form action={schedulePostAction} className="adm-post-sched">
                <input type="hidden" name="id" value={selected.id} />
                <input type="date" name="scheduledDate" defaultValue={selected.scheduledDate ?? ""} />
                <input type="time" name="scheduledTime" defaultValue={selected.scheduledTime ?? ""} />
                <button className="adm-btn ghost sm" type="submit">Reprogrammer</button>
              </form>
              <form action={publishPostAction}>
                <input type="hidden" name="id" value={selected.id} />
                <button className="adm-btn sm" type="submit">Publier maintenant</button>
              </form>
              <form action={deletePostAction}>
                <input type="hidden" name="id" value={selected.id} />
                <button className="adm-btn danger sm" type="submit">Supprimer</button>
              </form>
            </div>
          )}
          {selected.status === "publie" && selected.publishedAt && (
            <p className="muted" style={{ marginTop: ".6rem", fontSize: ".85rem" }}>
              Publié le {new Date(selected.publishedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.
            </p>
          )}
        </div>
      )}

      {/* Brouillons à planifier */}
      <div className="adm-card" style={{ marginTop: "1.2rem" }}>
        <h2>Brouillons à planifier {drafts.length > 0 && `(${drafts.length})`}</h2>
        {drafts.length === 0 ? (
          <p className="muted">
            Aucun brouillon en attente. <Link href="/admin/communication/reseaux">Rédigez un post</Link> ou demandez à Alfred.
          </p>
        ) : (
          <div className="pl-drafts">
            {drafts.map((p) => (
              <div key={p.id} className="pl-draft">
                <div className="pl-draft-head">
                  <NetDot n={p.network} />
                  <span className="t">{p.content.slice(0, 80)}</span>
                </div>
                <form action={schedulePostAction} className="adm-post-sched">
                  <input type="hidden" name="id" value={p.id} />
                  <input type="date" name="scheduledDate" defaultValue={today} />
                  <input type="time" name="scheduledTime" defaultValue="09:00" />
                  <button className="adm-btn sm" type="submit">Planifier</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
