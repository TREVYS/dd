import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getLegalDoc, formatUpdated } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du site Trevys Advisory : données collectées, finalités, durées de conservation, vos droits RGPD.",
  alternates: { canonical: "/politique-de-confidentialite" },
  robots: { index: false, follow: true },
};

export default function Page() {
  const doc = getLegalDoc("politique-de-confidentialite");
  if (!doc) notFound();

  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Informations légales</span>
          <h1 style={{ textTransform: "none" }}>{doc.title}</h1>
          {doc.updated && (
            <p>Dernière mise à jour : {formatUpdated(doc.updated)}</p>
          )}
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: "820px" }}>
          <article className="mkt-article">
            <MDXRemote source={doc.content} />
          </article>
        </div>
      </section>
    </>
  );
}
