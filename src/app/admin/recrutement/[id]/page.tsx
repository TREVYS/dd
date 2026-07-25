import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs";
import { JobForm } from "../job-form";

export const dynamic = "force-dynamic";

export default async function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Modifier l&apos;offre</h1>
          <p>
            /nous-rejoindre/{job.slug} · 👁 {job.views ?? 0} vue{(job.views ?? 0) > 1 ? "s" : ""} ·
            {job.applications ?? 0} candidature{(job.applications ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <JobForm job={job} />
    </>
  );
}
