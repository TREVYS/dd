import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { listVideos } from "@/lib/videos";
import { BlogList } from "./blog-list";
import { VideoGallery } from "./video-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ressources",
  description:
    "Analyses, guides et décryptages de Trevys sur la facturation électronique, la fiscalité, la comptabilité et l'innovation.",
  alternates: { canonical: "/blog" },
};

export default function Page() {
  const posts = getAllPosts();
  const videos = listVideos();
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Ressources</span>
          <h1>Nos <em>ressources</em> : l&apos;actu du chiffre et de la réforme</h1>
          <p>
            Analyses, guides pratiques et décryptages de nos équipes sur la
            facturation électronique, la fiscalité, la comptabilité et
            l&apos;innovation.
          </p>
          <a
            className="mkt-guide-card"
            href="https://forms.cloud.microsoft/e/mr63uL9LsU"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mkt-guide-ic" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              </svg>
            </span>
            <span className="mkt-guide-tx">
              <small>Guide gratuit · PDF</small>
              <b>Facturation électronique</b>
              <span className="mkt-guide-sub">Le guide complet de la réforme</span>
            </span>
            <span className="mkt-guide-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      {videos.length > 0 && (
        <section className="sec" style={{ paddingBottom: 0 }}>
          <div className="wrap">
            <div className="shead">
              <span className="eyebrow">En vidéo</span>
              <h2>Nos <em>prises de parole</em></h2>
              <p>Nos experts décryptent la facturation électronique, l&apos;intelligence artificielle et l&apos;innovation.</p>
            </div>
            <VideoGallery videos={videos} />
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <BlogList posts={posts} />
        </div>
      </section>
    </>
  );
}
