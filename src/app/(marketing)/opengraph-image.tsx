import { ImageResponse } from "next/og";

export const alt = "Trevys — Expertise comptable & conseil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage social (og:image) : logo Trevys (badge TS doré) + le mot
// TREVYS, et Alfred en silhouette élégante. Fond orange de la marque.
// Générée à la construction — aucune ressource externe requise.
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
        {/* Colonne texte, avec le logo */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {/* Badge TS doré (logo Trevys) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 108,
                height: 108,
                borderRadius: 26,
                background: "linear-gradient(160deg, #E8B33C 0%, #C99527 100%)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                color: "#171310",
                fontSize: 56,
                fontWeight: 800,
                letterSpacing: -3,
              }}
            >
              TS.
            </div>
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: 2, lineHeight: 1 }}>
              Trevys
            </div>
          </div>

          <div style={{ fontSize: 25, letterSpacing: 6, opacity: 0.92, marginTop: 34 }}>
            EXPERTISE COMPTABLE &amp; CONSEIL
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 32,
              opacity: 0.96,
              marginTop: 30,
              lineHeight: 1.35,
            }}
          >
            <div>L&apos;expertise du chiffre,</div>
            <div>la vitesse de la technologie.</div>
          </div>
          <div style={{ fontSize: 23, opacity: 0.85, marginTop: 36 }}>www.trevys.fr</div>
        </div>

        {/* Alfred — silhouette élégante */}
        <div
          style={{
            display: "flex",
            width: 360,
            height: 460,
            borderRadius: 32,
            background: "rgba(23,19,16,0.92)",
            border: "1px solid rgba(255,255,255,0.25)",
            alignItems: "flex-end",
            justifyContent: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          <svg width="330" height="430" viewBox="0 0 200 260">
            {/* halo discret */}
            <circle cx="100" cy="88" r="72" fill="rgba(245,129,31,0.14)" />
            {/* épaules / smoking */}
            <path d="M22 260c4-56 34-84 78-84s74 28 78 84z" fill="#0d0b09" />
            <path d="M22 260c4-56 34-84 78-84s74 28 78 84z" fill="none" stroke="rgba(232,179,60,0.35)" strokeWidth="1.5" />
            {/* revers */}
            <path d="M100 178l-24 34 14 8 10-30zM100 178l24 34-14 8-10-30z" fill="#1c1712" />
            {/* chemise */}
            <path d="M100 178l-13 22 13 34 13-34z" fill="#f5efe6" />
            {/* nœud papillon doré */}
            <path d="M100 196l-16-9v18zM100 196l16-9v18z" fill="#E8B33C" />
            <rect x="96" y="191" width="8" height="10" rx="2" fill="#C99527" />
            {/* cou */}
            <path d="M88 152h24v26H88z" fill="#e9c39a" />
            {/* tête, profil digne */}
            <path
              d="M100 44c26 0 42 18 42 44 0 20-9 38-24 46-11 6-25 6-36 0-15-8-24-26-24-46 0-26 16-44 42-44z"
              fill="#f0cba3"
            />
            {/* cheveux gris impeccables, raie */}
            <path
              d="M58 84c-2-26 16-44 42-44s44 18 42 44c-1-14-8-22-16-24 2 4 2 8 1 10-6-10-18-14-27-14s-21 4-27 14c-1-2-1-6 1-10-8 2-15 10-16 24z"
              fill="#b9b9b9"
            />
            {/* sourcils fins */}
            <path d="M74 92c6-4 12-4 17-2M109 90c5-2 11-2 17 2" stroke="#8f8f8f" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* yeux — regard posé */}
            <path d="M78 101c4 3 9 3 13 0M109 101c4 3 9 3 13 0" stroke="#3a2f26" strokeWidth="3.4" fill="none" strokeLinecap="round" />
            {/* monocle doré */}
            <circle cx="115" cy="102" r="12" fill="none" stroke="#E8B33C" strokeWidth="2.4" />
            <path d="M126 111c6 8 8 18 6 28" stroke="#E8B33C" strokeWidth="1.8" fill="none" />
            {/* nez droit */}
            <path d="M100 100c3 8 3 14-1 18" stroke="#d8a878" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* moustache soignée */}
            <path d="M82 128c6-5 13-6 18-3 5-3 12-2 18 3-5 6-12 7-18 4-6 3-13 2-18-4z" fill="#a8a8a8" />
            {/* sourire discret */}
            <path d="M89 140c7 5 15 5 22 0" stroke="#c4906a" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* pochette */}
            <path d="M138 226l14-10 4 16z" fill="#E8B33C" />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
