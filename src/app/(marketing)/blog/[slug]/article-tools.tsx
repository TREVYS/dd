"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/blog";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="mkt-arttoc" aria-label="Sommaire">
      <span className="mkt-artsum-lbl">Sommaire</span>
      <ul>
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "sub" : ""}>
            <a
              href={`#${h.id}`}
              className={active === h.id ? "on" : ""}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  history.replaceState(null, "", `#${h.id}`);
                }
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* annulé — on retombe sur la copie */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const linkedin = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`,
      "_blank",
      "noopener,width=600,height=600"
    );

  return (
    <div className="mkt-artshare">
      <span className="mkt-artsum-lbl">Partager</span>
      <div className="mkt-artshare-row">
        <button type="button" onClick={linkedin} aria-label="Partager sur LinkedIn">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
          </svg>
          LinkedIn
        </button>
        <button type="button" onClick={share} aria-label="Copier le lien">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11.5 4.5M14 11a5 5 0 00-7.07 0L4.1 13.83a5 5 0 007.07 7.07L12.5 19.5" />
          </svg>
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}
