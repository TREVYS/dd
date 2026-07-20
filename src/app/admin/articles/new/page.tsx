import { ArticleForm } from "../article-form";

export default function NewArticle() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Nouvel article</h1>
          <p>Rédigez et publiez une ressource sur le site.</p>
        </div>
      </div>
      <ArticleForm />
    </>
  );
}
