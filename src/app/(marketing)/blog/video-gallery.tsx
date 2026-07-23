"use client";

import { useEffect, useState } from "react";
import type { Video } from "@/lib/videos";

// Galerie de vidéos : vignettes cliquables ; un clic ouvre une fenêtre (lightbox)
// qui lit la vidéo YouTube. La vidéo n'est chargée qu'à l'ouverture.
export function VideoGallery({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!videos.length) return null;

  return (
    <div className="mkt-vid-wrap">
      <div className="mkt-vid-grid">
        {videos.map((v) => (
          <button key={v.id} className="mkt-vid-card" onClick={() => setActive(v)} type="button">
            <span className="mkt-vid-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
                alt={v.title}
                loading="lazy"
              />
              <span className="mkt-vid-play" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
            <span className="mkt-vid-body">
              <span className="mkt-vid-focus">{v.focus}</span>
              <span className="mkt-vid-title">{v.title}</span>
              {v.note && <span className="mkt-vid-note">{v.note}</span>}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div className="mkt-vid-modal" role="dialog" aria-modal="true" aria-label={active.title} onClick={() => setActive(null)}>
          <div className="mkt-vid-modal-in" onClick={(e) => e.stopPropagation()}>
            <button className="mkt-vid-close" onClick={() => setActive(null)} aria-label="Fermer" type="button">×</button>
            <div className="mkt-vid-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mkt-vid-cap">
              <b>{active.title}</b>
              {active.note && <span> · {active.note}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
