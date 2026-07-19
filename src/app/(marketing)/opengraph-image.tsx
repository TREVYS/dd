import { ImageResponse } from "next/og";

export const alt = "Trevys — Expertise comptable & conseil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage social (og:image) générée à la construction — aucune
// ressource externe requise.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #7C3AED 0%, #6D28D9 55%, #C81FD4 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 4, opacity: 0.85 }}>
            TREVYS
          </div>
          <div style={{ fontSize: 20, letterSpacing: 8, opacity: 0.7, marginTop: 8 }}>
            EXPERTISE COMPTABLE &amp; CONSEIL
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 960 }}>
            L&apos;expertise du chiffre, la vitesse de la technologie.
          </div>
          <div style={{ fontSize: 30, opacity: 0.9, marginTop: 28 }}>
            Expertise comptable · Consulting · Facturation électronique · IA
          </div>
        </div>

        <div style={{ fontSize: 24, opacity: 0.8 }}>www.trevys-advisory.fr</div>
      </div>
    ),
    { ...size },
  );
}
