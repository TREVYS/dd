import { PageForm } from "../page-form";

export default function NewPage() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Nouvelle page</h1>
          <p>Créez une page publiée sur /p/&lt;slug&gt;.</p>
        </div>
      </div>
      <PageForm />
    </>
  );
}
