import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const TEAM = [
  { n: "John Lévy", f: "/brand/team/john-levy.jpg" },
  { n: "Olivier Bonnin", f: "/brand/team/olivier-bonnin.jpg" },
  { n: "Walther Ottgen", f: "/brand/team/walther-ottgen.jpg" },
  { n: "Jeremy Roch", f: "/brand/team/jeremy-roch.jpg" },
];

export default function AdminMedias() {
  const images = Array.from(
    new Set(getAllPosts().map((p) => p.image).filter(Boolean) as string[]),
  );
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Médias</h1>
          <p>Images utilisées sur le site. Collez une URL dans un article ou une page pour l&apos;afficher.</p>
        </div>
      </div>

      <div className="adm-note" style={{ marginBottom: "1.5rem" }}>
        <b>Comment ajouter une image ?</b> Hébergez-la (Médias WordPress ou tout hébergeur),
        copiez son URL, puis collez-la dans le champ « Image » d&apos;un article ou dans le
        contenu Markdown : <code>![description](https://…)</code>. Les photos d&apos;équipe se
        déposent dans <code>public/brand/team/</code>.
      </div>

      <div className="adm-card">
        <h2>Photos de l&apos;équipe</h2>
        <table className="adm-table">
          <tbody>
            {TEAM.map((t) => (
              <tr key={t.f}>
                <td style={{ fontWeight: 700 }}>{t.n}</td>
                <td className="muted">{t.f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-card">
        <h2>Images des articles ({images.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "1rem" }}>
          {images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", borderRadius: 10, border: "1px solid var(--line)" }} />
          ))}
          {images.length === 0 && <p className="muted">Aucune image référencée.</p>}
        </div>
      </div>
    </>
  );
}
