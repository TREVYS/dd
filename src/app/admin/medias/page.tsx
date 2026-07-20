import { MediaLibrary } from "./media-library";

export const dynamic = "force-dynamic";

export default function AdminMedias() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Médias</h1>
          <p>Importez et gérez vos images et documents — hébergés sur votre instance.</p>
        </div>
      </div>

      <div className="adm-note" style={{ marginBottom: "1.4rem" }}>
        Les fichiers importés sont stockés sur le serveur (<code>public/uploads/</code>) et
        accessibles à l&apos;adresse <code>/uploads/…</code>. Copiez l&apos;URL d&apos;un média
        pour l&apos;utiliser dans le champ « Image » d&apos;un article, ou dans le contenu :
        <code>![description](URL)</code>.
      </div>

      <MediaLibrary />
    </>
  );
}
