import { listPosts, type PostStatus } from "@/lib/social-posts";
import { publicStatus } from "@/lib/social";
import { PostComposer } from "./post-composer";
import { schedulePostAction, deletePostAction, publishPostAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<PostStatus, string> = {
  brouillon: "Brouillons",
  planifie: "Planifiés",
  publie: "Publiés",
};

function NetBadge({ n }: { n: "linkedin" | "instagram" }) {
  return (
    <span
      className="adm-netbadge"
      style={{ background: n === "linkedin" ? "#0A66C2" : "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)" }}
    >
      {n === "linkedin" ? "in" : "IG"}
    </span>
  );
}

export default function ReseauxPage() {
  const posts = listPosts();
  const accounts = publicStatus();
  const anyConnected = accounts.some((a) => a.connected);

  const groups: PostStatus[] = ["brouillon", "planifie", "publie"];

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Réseaux sociaux</h1>
          <p>Préparez, planifiez et publiez vos posts LinkedIn et Instagram. Alfred peut les rédiger pour vous.</p>
        </div>
      </div>

      <div
        className="adm-note"
        style={{
          marginBottom: "1.2rem",
          borderColor: anyConnected ? "#bfe3c9" : "#f0e2cf",
          background: anyConnected ? "#f1faf3" : "#fdf8f0",
        }}
      >
        {anyConnected
          ? "🔗 Comptes connectés : la publication réelle est active."
          : "ℹ️ Aucun compte connecté pour l'instant : vous travaillez en mode brouillon. Connectez LinkedIn/Instagram dans Réglages pour activer la publication réelle. « Publier » marquera les posts comme publiés en attendant."}
      </div>

      <PostComposer />

      {groups.map((g) => {
        const items = posts.filter((p) => p.status === g);
        return (
          <div className="adm-card" key={g} style={{ marginTop: "1.4rem" }}>
            <h2>{STATUS_LABEL[g]} {items.length > 0 && `(${items.length})`}</h2>
            {items.length === 0 ? (
              <p className="muted">Aucun post.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
                {items.map((p) => (
                  <div key={p.id} className="adm-post">
                    <div className="adm-post-head">
                      <NetBadge n={p.network} />
                      <span className="muted" style={{ fontSize: ".78rem" }}>
                        {p.status === "planifie" && p.scheduledDate ? `Prévu le ${p.scheduledDate}` : ""}
                        {p.status === "publie" && p.publishedAt ? `Publié le ${new Date(p.publishedAt).toLocaleDateString("fr-FR")}` : ""}
                        {p.status === "brouillon" ? "Brouillon" : ""}
                      </span>
                    </div>
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" style={{ maxHeight: 140, borderRadius: 10, border: "1px solid var(--line)", marginBottom: ".6rem" }} />
                    )}
                    <div className="adm-post-body">{p.content}</div>
                    {p.status !== "publie" && (
                      <div className="adm-post-actions">
                        <form action={schedulePostAction} className="adm-post-sched">
                          <input type="hidden" name="id" value={p.id} />
                          <input type="date" name="scheduledDate" defaultValue={p.scheduledDate ?? ""} />
                          <button className="adm-btn ghost sm" type="submit">Programmer</button>
                        </form>
                        <form action={publishPostAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="adm-btn sm" type="submit">Publier</button>
                        </form>
                        <form action={deletePostAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="adm-btn danger sm" type="submit">Suppr.</button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
