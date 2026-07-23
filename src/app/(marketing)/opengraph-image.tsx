import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const alt = "Trevys — Expertise comptable & conseil";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Générée à la demande : le logo (médiathèque de l'instance) est lu sur le
// disque au moment du rendu.
export const dynamic = "force-dynamic";

// Logo blanc importé dans la médiathèque (public/uploads/2-blanc.png).
function loadLogo(): string | null {
  try {
    const p = path.join(process.cwd(), "public", "uploads", "2-blanc.png");
    if (!fs.existsSync(p)) return null;
    return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    return null;
  }
}

// Image de partage social : 100 % visuelle (aucun texte) — le logo Trevys
// blanc au centre d'une scène futuriste haut de gamme, connotée conseil :
// colonnes de croissance lumineuses, orbites, réseau de données.
export default function OpengraphImage() {
  const logo = loadLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "radial-gradient(760px 480px at 50% 38%, rgba(245,129,31,0.30) 0%, rgba(245,129,31,0) 62%), radial-gradient(900px 400px at 100% 0%, rgba(232,179,60,0.18) 0%, rgba(232,179,60,0) 55%), radial-gradient(700px 400px at 0% 100%, rgba(245,129,31,0.14) 0%, rgba(245,129,31,0) 55%), linear-gradient(160deg, #0b0805 0%, #140d06 55%, #1b1108 100%)",
        }}
      >
        {/* Scène : orbites, réseau, colonnes de croissance */}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {/* sol en perspective */}
          <path d="M0 560 L1200 500" stroke="rgba(245,129,31,0.25)" strokeWidth="1.4" />
          <path d="M0 600 L1200 560" stroke="rgba(245,129,31,0.14)" strokeWidth="1.2" />
          <path d="M0 520 L1200 445" stroke="rgba(245,129,31,0.10)" strokeWidth="1" />

          {/* orbites autour du centre */}
          <ellipse cx="600" cy="315" rx="430" ry="180" fill="none" stroke="rgba(245,129,31,0.20)" strokeWidth="1.4" />
          <ellipse cx="600" cy="315" rx="330" ry="132" fill="none" stroke="rgba(245,129,31,0.30)" strokeWidth="1.2" strokeDasharray="3 10" />
          <ellipse cx="600" cy="315" rx="540" ry="235" fill="none" stroke="rgba(232,179,60,0.14)" strokeWidth="1.2" />

          {/* satellites lumineux sur les orbites */}
          <circle cx="170" cy="315" r="7" fill="#F5811F" />
          <circle cx="170" cy="315" r="15" fill="rgba(245,129,31,0.25)" />
          <circle cx="1030" cy="315" r="5" fill="#E8B33C" />
          <circle cx="600" cy="135" r="4" fill="#ffffff" />
          <circle cx="880" cy="205" r="5" fill="#F5811F" />
          <circle cx="320" cy="430" r="5" fill="#E8B33C" />

          {/* colonnes de croissance (connotation conseil / performance) */}
          <g>
            <rect x="905" y="430" width="26" height="80" rx="6" fill="rgba(245,129,31,0.30)" />
            <rect x="945" y="390" width="26" height="120" rx="6" fill="rgba(245,129,31,0.45)" />
            <rect x="985" y="345" width="26" height="165" rx="6" fill="rgba(245,129,31,0.65)" />
            <rect x="1025" y="290" width="26" height="220" rx="6" fill="#F5811F" />
            <circle cx="1038" cy="272" r="7" fill="#ffffff" />
            <path d="M918 420 L958 378 L998 332 L1038 276" stroke="#E8B33C" strokeWidth="2.6" fill="none" />
          </g>
          <g>
            <rect x="150" y="455" width="22" height="60" rx="5" fill="rgba(232,179,60,0.30)" />
            <rect x="184" y="425" width="22" height="90" rx="5" fill="rgba(232,179,60,0.45)" />
            <rect x="218" y="388" width="22" height="127" rx="5" fill="rgba(232,179,60,0.65)" />
          </g>

          {/* réseau de données discret */}
          <path d="M255 175 L360 235 L470 195" stroke="rgba(245,129,31,0.35)" strokeWidth="1.4" fill="none" />
          <circle cx="255" cy="175" r="4" fill="#F5811F" />
          <circle cx="360" cy="235" r="5" fill="#E8B33C" />
          <circle cx="470" cy="195" r="3.5" fill="#ffffff" />
          <path d="M760 150 L850 120 L930 155" stroke="rgba(245,129,31,0.3)" strokeWidth="1.4" fill="none" />
          <circle cx="850" cy="120" r="4.5" fill="#F5811F" />
          <circle cx="930" cy="155" r="3.5" fill="#E8B33C" />

          {/* anneau lumineux central derrière le logo */}
          <circle cx="600" cy="315" r="185" fill="none" stroke="rgba(245,129,31,0.5)" strokeWidth="1.8" />
          <circle cx="600" cy="315" r="186" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="6" />
          <circle cx="600" cy="130" r="6" fill="#F5811F" />
          <circle cx="600" cy="130" r="12" fill="rgba(245,129,31,0.3)" />
        </svg>

        {/* Logo Trevys blanc, au centre */}
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            width={430}
            style={{ objectFit: "contain", maxHeight: 260 }}
            alt=""
          />
        ) : (
          // Repli si le fichier n'est pas encore sur l'instance : badge doré.
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 56,
              background: "linear-gradient(160deg, #F1BE4B 0%, #C99527 100%)",
              boxShadow: "0 0 90px rgba(232,179,60,0.5)",
              color: "#171310",
              fontSize: 108,
              fontWeight: 800,
              letterSpacing: -5,
            }}
          >
            TS.
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
