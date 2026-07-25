import { JobForm } from "../job-form";

export const dynamic = "force-dynamic";

export default function NewJob() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Nouvelle offre</h1>
          <p>Rédigez (ou faites rédiger par Alfred), enregistrez en brouillon, puis publiez.</p>
        </div>
      </div>
      <JobForm />
    </>
  );
}
