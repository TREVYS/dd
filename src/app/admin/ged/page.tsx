import Link from "next/link";
import { readAlfred, GED_THEMES } from "@/lib/alfred-config";
import { KnowledgeDropZone } from "../reglages/alfred/dropzone";
import { setDocThemeAction, deleteDocAction } from "./actions";

export const dynamic = "force-dynamic";

// GED — la base documentaire d'Alfred : dépôt, navigation par thème,
// recherche, aperçu du texte extrait, rangement et suppression.
export default async function GedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; theme?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const theme = sp.theme ?? "";

  const docs = (readAlfred().knowledge ?? [])
    .slice()
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  const counts: Record<string, number> = {};
  for (const d of docs) {
    const t = d.theme || "Non classé";
    counts[t] = (counts[t] ?? 0) + 1;
  }

  const filtered = docs.filter((d) => {
    if (theme === "nonclasse" && d.theme) return false;
    if (theme && theme !== "nonclasse" && d.theme !== theme) return false;
    if (q && !`${d.title} ${d.source} ${d.text}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const kChars = docs.reduce((s, d) => s + d.text.length, 0);

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>GED — Documents d&apos;Alfred</h1>
          <p>
            {docs.length} document{docs.length > 1 ? "s" : ""} · {Math.round(kChars / 1000)} k caractères de savoir.
            Rangez-les par thème : Alfred cible la bonne documentation selon le sujet traité.
          </p>
        </div>
        <Link className="adm-btn ghost" href="/admin/medias">Images → Médias</Link>
      </div>

      {/* Dépôt */}
      <div className="adm-card">
        <h2>Ajouter des documents</h2>
        <KnowledgeDropZone />
        <p className="muted" style={{ fontSize: ".78rem", color: "var(--ink3)", margin: ".7rem 0 0" }}>
          Vous pouvez aussi transmettre des fichiers à Alfred par le trombone du chat ou en pièce jointe Telegram.
        </p>
      </div>

      {/* Filtres : thèmes + recherche */}
      <div className="adm-card">
        <div style={{ display: "flex", gap: ".45rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <Link href="/admin/ged" className={!theme ? "adm-btn sm" : "adm-btn ghost sm"}>
            Tous ({docs.length})
          </Link>
          {GED_THEMES.map((t) => (
            <Link
              key={t}
              href={`/admin/ged?theme=${encodeURIComponent(t)}`}
              className={theme === t ? "adm-btn sm" : "adm-btn ghost sm"}
            >
              {t} {counts[t] ? `(${counts[t]})` : ""}
            </Link>
          ))}
          {counts["Non classé"] > 0 && (
            <Link href="/admin/ged?theme=nonclasse" className={theme === "nonclasse" ? "adm-btn sm" : "adm-btn ghost sm"}>
              Non classé ({counts["Non classé"]})
            </Link>
          )}
        </div>

        <form method="get" action="/admin/ged" style={{ display: "flex", gap: ".6rem", maxWidth: 480 }}>
          {theme && <input type="hidden" name="theme" value={theme} />}
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Rechercher dans les titres et le contenu…"
            style={{ flex: 1 }}
          />
          <button className="adm-btn ghost sm" type="submit">Rechercher</button>
        </form>

        {/* Liste des documents */}
        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginTop: "1.2rem" }}>
          {filtered.length === 0 && (
            <p className="muted">
              {docs.length === 0
                ? "Aucun document pour l'instant — déposez vos premiers fichiers ci-dessus."
                : "Aucun document ne correspond à ce filtre."}
            </p>
          )}
          {filtered.map((d) => (
            <div key={d.id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1rem 1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                  <div className="muted" style={{ fontSize: ".78rem" }}>
                    {d.source} · {new Date(d.addedAt).toLocaleDateString("fr-FR")} · {Math.round(d.text.length / 1000)} k car.
                    {d.theme && <> · <b style={{ color: "var(--o)" }}>{d.theme}</b></>}
                  </div>
                </div>
                <form action={setDocThemeAction} style={{ display: "flex", gap: ".4rem", alignItems: "center", flex: "none" }}>
                  <input type="hidden" name="id" value={d.id} />
                  <select name="theme" defaultValue={d.theme ?? ""} style={{ fontSize: ".82rem" }}>
                    <option value="">Non classé</option>
                    {GED_THEMES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button className="adm-btn ghost sm" type="submit">Ranger</button>
                </form>
                <form action={deleteDocAction} style={{ flex: "none" }}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="adm-btn danger sm" type="submit">Supprimer</button>
                </form>
              </div>
              <details style={{ marginTop: ".5rem" }}>
                <summary style={{ cursor: "pointer", fontSize: ".8rem", color: "var(--ink3)", fontWeight: 600 }}>
                  Aperçu du contenu extrait
                </summary>
                <p style={{ fontSize: ".82rem", color: "var(--ink2)", lineHeight: 1.6, margin: ".5rem 0 0", whiteSpace: "pre-wrap" }}>
                  {d.text.slice(0, 1200)}{d.text.length > 1200 ? "…" : ""}
                </p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
