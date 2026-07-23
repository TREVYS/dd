import { ImageResponse } from "next/og";

export const alt = "Trevys — Expertise comptable & conseil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage social (og:image) : version futuriste haut de gamme —
// fond sombre premium, lueurs orange, réseau de données, logo TS doré.
// Générée à la construction — aucune ressource externe requise.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(900px 500px at 88% 10%, rgba(245,129,31,0.28) 0%, rgba(245,129,31,0) 60%), radial-gradient(700px 420px at 0% 100%, rgba(232,179,60,0.16) 0%, rgba(232,179,60,0) 55%), linear-gradient(135deg, #0c0906 0%, #150e07 55%, #1c1207 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Réseau de données futuriste, à droite */}
        <svg
          width="620"
          height="630"
          viewBox="0 0 620 630"
          style={{ position: "absolute", right: 0, top: 0 }}
        >
          {/* arcs orbitaux */}
          <circle cx="470" cy="300" r="230" fill="none" stroke="rgba(245,129,31,0.22)" strokeWidth="1.4" />
          <circle cx="470" cy="300" r="168" fill="none" stroke="rgba(245,129,31,0.32)" strokeWidth="1.4" strokeDasharray="4 10" />
          <circle cx="470" cy="300" r="110" fill="none" stroke="rgba(232,179,60,0.4)" strokeWidth="1.6" />
          {/* lignes de connexion */}
          <path d="M240 470 L360 380 L470 410 L580 330" stroke="rgba(245,129,31,0.5)" strokeWidth="1.6" fill="none" />
          <path d="M300 130 L400 210 L470 190 L560 240" stroke="rgba(245,129,31,0.4)" strokeWidth="1.6" fill="none" />
          <path d="M360 380 L400 210" stroke="rgba(245,129,31,0.28)" strokeWidth="1.2" fill="none" />
          <path d="M470 410 L470 190" stroke="rgba(232,179,60,0.3)" strokeWidth="1.2" fill="none" />
          {/* nœuds lumineux */}
          <circle cx="360" cy="380" r="7" fill="#F5811F" />
          <circle cx="360" cy="380" r="14" fill="rgba(245,129,31,0.25)" />
          <circle cx="470" cy="410" r="5" fill="#E8B33C" />
          <circle cx="400" cy="210" r="6" fill="#F5811F" />
          <circle cx="400" cy="210" r="12" fill="rgba(245,129,31,0.22)" />
          <circle cx="470" cy="190" r="4" fill="#ffffff" />
          <circle cx="560" cy="240" r="5" fill="#E8B33C" />
          <circle cx="580" cy="330" r="6" fill="#F5811F" />
          <circle cx="240" cy="470" r="4" fill="#ffffff" />
          {/* éclat central */}
          <circle cx="470" cy="300" r="30" fill="rgba(245,129,31,0.5)" />
          <circle cx="470" cy="300" r="14" fill="#F5811F" />
          <circle cx="470" cy="300" r="6" fill="#ffffff" />
        </svg>

        {/* fine ligne d'horizon */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 118,
            width: "100%",
            height: 1,
            background:
              "linear-gradient(90deg, rgba(245,129,31,0) 0%, rgba(245,129,31,0.55) 30%, rgba(245,129,31,0) 80%)",
          }}
        />

        {/* Contenu */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 90px",
            maxWidth: 760,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 96,
                height: 96,
                borderRadius: 24,
                background: "linear-gradient(160deg, #F1BE4B 0%, #C99527 100%)",
                boxShadow: "0 0 44px rgba(232,179,60,0.45)",
                color: "#171310",
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              TS.
            </div>
            <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>
              Trevys
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 42,
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: -0.5,
            }}
          >
            <div style={{ display: "flex" }}>L&apos;expertise du chiffre,</div>
            <div style={{ display: "flex", color: "#F5A94F" }}>la vitesse de la technologie.</div>
          </div>

          {/* Services */}
          <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
            {["Expertise comptable", "Conseil", "Facturation électronique", "IA"].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  padding: "9px 22px",
                  borderRadius: 100,
                  border: "1px solid rgba(245,129,31,0.45)",
                  background: "rgba(245,129,31,0.10)",
                  fontSize: 21,
                  fontWeight: 600,
                  color: "#FBD9B0",
                }}
              >
                {s}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 44,
              fontSize: 22,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <div style={{ display: "flex", width: 34, height: 2, background: "#F5811F" }} />
            À votre service — www.trevys.fr
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
