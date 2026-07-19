import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getLegalDoc, formatUpdated } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Trevys Advisory (T.A. TREVYS ADVISORY).",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

export default function Page() {
  const doc = getLegalDoc("mentions-legales");
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
