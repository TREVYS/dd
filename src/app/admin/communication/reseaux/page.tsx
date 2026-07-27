import { BrouillonsTabs } from "../brouillons-tabs";
import { listPosts, type PostStatus } from "@/lib/social-posts";
import { publicStatus } from "@/lib/social";
import { PostComposer } from "./post-composer";
import { ImageField } from "../../image-field";
import { FeedbackThumbs } from "../../feedback-thumbs";
import { schedulePostAction, deletePostAction, publishPostAction, deleteAllDraftsAction, setPostImageAction } from "./actions";

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

export default async function ReseauxPage({
  searchParams,
}: {
  searchParams: Promise<{ puberr?: string }>;
}) {
  const sp = await searchParams;
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

      <BrouillonsTabs />

      <div
        className="adm-note"
        style={{
          marginBottom: "1.2rem",
          borderColor: anyConnected ? "#bfe3c9" : "#f0e2cf",
          background: anyConnected ? "#f1faf3" : "#fdf8f0",
        }}
      >
        {anyConnected
          ? "Comptes connectés : la publication réelle est active."
          : "Aucun compte connecté pour l'instant : vous travaillez en mode brouillon. Connectez LinkedIn/Instagram dans Réglages pour activer la publication réelle. « Publier » marquera les posts comme publiés en attendant."}
      </div>

      {sp.puberr && (
        <div className="adm-note" style={{ marginBottom: "1.2rem", borderColor: "#f0d5d1", background: "#fdf3f2" }}>
          La publication a échoué — le post reste en brouillon. Détail : {sp.puberr}
        </div>
      )}

      <PostComposer />

      {groups.map((g) => {
        let items = posts.filter((p) => p.status === g);
        // Publiés : on ne garde à l'écran que le dernier post (l'historique
        // complet n'a pas d'intérêt ici — il vit sur les réseaux eux-mêmes).
        const publishedTotal = g === "publie" ? items.length : 0;
        if (g === "publie") {
          items = [...items]
            .sort((a, b) => ((a.publishedAt ?? a.createdAt) < (b.publishedAt ?? b.createdAt) ? 1 : -1))
            .slice(0, 1);
        }
        return (
          <div className="adm-card" key={g} style={{ marginTop: "1.4rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <h2 style={{ margin: 0 }}>
                {g === "publie" ? "Dernier post publié" : STATUS_LABEL[g]}{" "}
                {g !== "publie" && items.length > 0 && `(${items.length})`}
              </h2>
              {g === "brouillon" && items.length > 1 && (
                <form action={deleteAllDraftsAction}>
                  <button className="adm-btn danger sm" type="submit">Tout supprimer</button>
                </form>
              )}
            </div>
            {g === "publie" && publishedTotal > 1 && (
              <p className="muted" style={{ fontSize: ".8rem", margin: ".2rem 0 .8rem" }}>
                {publishedTotal - 1} post{publishedTotal > 2 ? "s" : ""} plus ancien{publishedTotal > 2 ? "s" : ""} masqué{publishedTotal > 2 ? "s" : ""}.
              </p>
            )}
            {items.length === 0 ? (
              <p className="muted">Aucun post.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
                {items.map((p) => (
                  <div key={p.id} className="adm-post">
                    <div className="adm-post-head">
                      <NetBadge n={p.network} />
                      <span className="muted" style={{ fontSize: ".78rem" }}>
                        {p.status === "planifie" && p.scheduledDate ? `Prévu le ${p.scheduledDate}${p.scheduledTime ? ` à ${p.scheduledTime}` : ""}` : ""}
                        {p.status === "publie" && p.publishedAt ? `Publié le ${new Date(p.publishedAt).toLocaleDateString("fr-FR")}` : ""}
                        {p.status === "brouillon" ? "Brouillon" : ""}
                      </span>
                      <span style={{ marginLeft: "auto" }}>
                        <FeedbackThumbs kind="post" refId={p.id} excerpt={p.content} back="/admin/communication/reseaux" />
                      </span>
                    </div>
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" style={{ maxHeight: 140, borderRadius: 10, border: "1px solid var(--line)", marginBottom: ".6rem" }} />
                    )}
                    <div className="adm-post-body">{p.content}</div>
                    {p.status !== "publie" && (
                      <form action={setPostImageAction} style={{ margin: ".6rem 0", maxWidth: 520 }}>
                        <input type="hidden" name="id" value={p.id} />
                        <div className="adm-field">
                          <label>Image du post <small>(médiathèque ou import)</small></label>
                          <ImageField name="image" defaultValue={p.image ?? ""} />
                        </div>
                        <button className="adm-btn ghost sm" type="submit" style={{ marginTop: ".4rem" }}>
                          Enregistrer l&apos;image
                        </button>
                      </form>
                    )}
                    {p.status !== "publie" && (
                      <div className="adm-post-actions">
                        <form action={schedulePostAction} className="adm-post-sched">
                          <input type="hidden" name="id" value={p.id} />
                          <input type="date" name="scheduledDate" defaultValue={p.scheduledDate ?? ""} />
                          <input type="time" name="scheduledTime" defaultValue={p.scheduledTime ?? ""} />
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
