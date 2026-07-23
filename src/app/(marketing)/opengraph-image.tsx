import { ImageResponse } from "next/og";

export const alt = "Trevys — Expertise comptable & conseil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage social (og:image) : Alfred, le majordome du cabinet,
// sur fond orange Trevys, avec le mot TREVYS. Générée à la construction —
// aucune ressource externe requise.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 90px",
          background:
            "linear-gradient(135deg, #F5811F 0%, #E26A0F 55%, #C2410C 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Texte */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: 6, lineHeight: 1 }}>
            TREVYS
          </div>
          <div style={{ fontSize: 26, letterSpacing: 6, opacity: 0.9, marginTop: 18 }}>
            EXPERTISE COMPTABLE &amp; CONSEIL
          </div>
          <div style={{ fontSize: 30, opacity: 0.95, marginTop: 44, lineHeight: 1.35 }}>
            L&apos;expertise du chiffre, la vitesse de la technologie.
          </div>
          <div style={{ fontSize: 24, opacity: 0.85, marginTop: 40 }}>www.trevys.fr</div>
        </div>

        {/* Alfred, le majordome */}
        <div
          style={{
            display: "flex",
            width: 380,
            height: 380,
            borderRadius: 190,
            background: "rgba(255,255,255,0.16)",
            border: "6px solid rgba(255,255,255,0.55)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="300" height="300" viewBox="0 0 120 120">
            {/* buste / queue-de-pie */}
            <path d="M24 118c2-26 16-36 36-36s34 10 36 36z" fill="#1d1d1f" />
            <path d="M52 86l8 12 8-12-8-4z" fill="#ffffff" />
            {/* nœud papillon */}
            <path d="M60 96l-10-6v12zM60 96l10-6v12z" fill="#F5C242" />
            <circle cx="60" cy="96" r="3" fill="#E26A0F" />
            {/* tête */}
            <ellipse cx="60" cy="52" rx="26" ry="28" fill="#f2c9a4" />
            {/* cheveux gris sur les côtés (crâne dégarni) */}
            <path d="M34 48c-2 8 0 16 4 20-6-2-9-12-7-20z" fill="#cfcfcf" />
            <path d="M86 48c2 8 0 16-4 20 6-2 9-12 7-20z" fill="#cfcfcf" />
            {/* oreilles */}
            <circle cx="33" cy="54" r="5" fill="#eab98f" />
            <circle cx="87" cy="54" r="5" fill="#eab98f" />
            {/* sourcils */}
            <path d="M44 44c4-3 9-3 12-1M64 43c3-2 8-2 12 1" stroke="#9a9a9a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            {/* yeux */}
            <circle cx="50" cy="51" r="3" fill="#2b2b2b" />
            <circle cx="70" cy="51" r="3" fill="#2b2b2b" />
            {/* nez */}
            <path d="M60 52c2 4 2 8-1 10" stroke="#d9a377" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            {/* moustache */}
            <path d="M47 68c4-4 9-5 13-3 4-2 9-1 13 3-4 4-9 5-13 3-4 2-9 1-13-3z" fill="#bdbdbd" />
            {/* sourire */}
            <path d="M52 75c5 4 11 4 16 0" stroke="#c98f63" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
