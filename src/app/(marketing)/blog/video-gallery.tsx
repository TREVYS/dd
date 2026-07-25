"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Video } from "@/lib/videos";

// Galerie de vidéos : vignettes cliquables ; un clic ouvre une fenêtre (lightbox)
// qui lit la vidéo YouTube. La fenêtre est rendue au niveau du document
// (portal) : elle passe TOUJOURS au premier plan, au-dessus des sections
// suivantes de la page. La vidéo n'est chargée qu'à l'ouverture.
const INITIAL_COUNT = 3; // vidéos visibles avant « Voir plus »

export function VideoGallery({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState<Video | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) return;
    setCopied(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!videos.length) return null;

  const videoUrl = (v: Video) => `https://youtu.be/${v.youtubeId}`;

  const copyLink = async (v: Video) => {
    try {
      await navigator.clipboard.writeText(videoUrl(v));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const visible = showAll ? videos : videos.slice(0, INITIAL_COUNT);
  const hidden = videos.length - INITIAL_COUNT;

  return (
    <div className="mkt-vid-wrap">
      <div className="mkt-vid-grid">
        {visible.map((v) => (
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

      {hidden > 0 && !showAll && (
        <div style={{ textAlign: "center", marginTop: "1.4rem" }}>
          <button className="btn btn-ghost" type="button" onClick={() => setShowAll(true)}>
            Voir plus de vidéos ({hidden})
          </button>
        </div>
      )}
      {showAll && hidden > 0 && (
        <div style={{ textAlign: "center", marginTop: "1.4rem" }}>
          <button className="btn btn-ghost" type="button" onClick={() => setShowAll(false)}>
            Voir moins
          </button>
        </div>
      )}

      {active && mounted &&
        createPortal(
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
              <div className="mkt-vid-share">
                <a
                  className="mkt-vid-share-btn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl(active))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z" />
                  </svg>
                  Partager sur LinkedIn
                </a>
                <button className="mkt-vid-share-btn" type="button" onClick={() => copyLink(active)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  {copied ? "Lien copié ✓" : "Copier le lien"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
