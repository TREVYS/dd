import { notFound } from "next/navigation";
import { getPage } from "@/lib/content-admin";
import { PageForm } from "../page-form";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Modifier la page</h1>
          <p>/p/{slug}</p>
        </div>
      </div>
      <PageForm page={{ slug, title: page.meta.title, description: page.meta.description, body: page.body }} />
    </>
  );
}
