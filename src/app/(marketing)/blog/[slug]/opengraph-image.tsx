import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getPost } from "@/lib/blog";

export const alt = "Article Trevys";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Générée à la demande : le logo (médiathèque de l'instance) est lu sur le
// disque au moment du rendu.
export const dynamic = "force-dynamic";

// Logo importé dans la médiathèque (public/uploads/1.png).
function loadLogo(): string | null {
  try {
    const p = path.join(process.cwd(), "public", "uploads", "1.png");
    if (!fs.existsSync(p)) return null;
    return `data:image/png;base64,${fs.readFileSync(p).toString("base64")}`;
  } catch {
    return null;
  }
}

// Étiquette de partage des articles : logo Trevys, titre de l'article, et les
// deux mascottes du cabinet — le chef d'orchestre (RFE) et le robot (IA) —
// dans l'univers futuriste orange.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.meta.title ?? "Ressources Trevys";
  const category = post?.meta.category ?? "Article";
  const logo = loadLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(820px 460px at 85% 20%, rgba(245,129,31,0.26) 0%, rgba(245,129,31,0) 60%), radial-gradient(600px 400px at 0% 100%, rgba(232,179,60,0.16) 0%, rgba(232,179,60,0) 55%), linear-gradient(150deg, #0b0805 0%, #150d06 55%, #1c1108 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Décor : orbites + mascottes (chef d'orchestre & robot) */}
        <svg width="520" height="630" viewBox="0 0 520 630" style={{ position: "absolute", right: 0, top: 0 }}>
          <ellipse cx="330" cy="330" rx="240" ry="150" fill="none" stroke="rgba(245,129,31,0.18)" strokeWidth="1.4" />
          <ellipse cx="330" cy="330" rx="170" ry="104" fill="none" stroke="rgba(245,129,31,0.28)" strokeWidth="1.2" strokeDasharray="3 9" />
          <path d="M40 560 L520 500" stroke="rgba(245,129,31,0.2)" strokeWidth="1.2" />

          {/* Chef d'orchestre (silhouette lumineuse, baguette levée) */}
          <g transform="translate(190,210)">
            <circle cx="60" cy="34" r="20" fill="none" stroke="#F5811F" strokeWidth="2.6" />
            <path d="M60 54 C34 60 26 86 26 122 H94 C94 86 86 60 60 54Z" fill="rgba(245,129,31,0.12)" stroke="#F5811F" strokeWidth="2.6" />
            <path d="M38 76 L6 44" stroke="#F5811F" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M6 44 L-8 22" stroke="#E8B33C" strokeWidth="3" strokeLinecap="round" />
            <circle cx="-10" cy="18" r="4" fill="#E8B33C" />
            <path d="M82 76 L112 52" stroke="#F5811F" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M54 62 L60 74 L66 62" fill="none" stroke="#E8B33C" strokeWidth="2.2" />
            {/* notes / signaux dirigés */}
            <circle cx="-26" cy="4" r="3" fill="#F5811F" />
            <circle cx="-40" cy="14" r="2.4" fill="rgba(245,129,31,0.6)" />
          </g>

          {/* Robot (tête arrondie, antenne, visière lumineuse) */}
          <g transform="translate(330,332)">
            <path d="M30 26 V10" stroke="#E8B33C" strokeWidth="3" strokeLinecap="round" />
            <circle cx="30" cy="6" r="5" fill="#E8B33C" />
            <rect x="-14" y="26" width="88" height="64" rx="22" fill="rgba(245,129,31,0.12)" stroke="#F5811F" strokeWidth="2.6" />
            <rect x="2" y="46" width="56" height="18" rx="9" fill="#0b0805" stroke="#F5811F" strokeWidth="2" />
            <circle cx="18" cy="55" r="5" fill="#F5811F" />
            <circle cx="42" cy="55" r="5" fill="#E8B33C" />
            <rect x="4" y="96" width="52" height="34" rx="12" fill="none" stroke="rgba(245,129,31,0.6)" strokeWidth="2.4" />
            <path d="M-14 104 h-16 M74 104 h16" stroke="rgba(245,129,31,0.6)" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* nœuds lumineux */}
          <circle cx="120" cy="150" r="4" fill="#F5811F" />
          <circle cx="470" cy="210" r="5" fill="#E8B33C" />
          <circle cx="440" cy="470" r="4" fill="#ffffff" />
          <circle cx="90" cy="330" r="6" fill="#F5811F" />
          <circle cx="90" cy="330" r="12" fill="rgba(245,129,31,0.25)" />
        </svg>

        {/* Colonne texte */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 70px",
            width: 730,
          }}
        >
          {/* Logo */}
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} height={84} style={{ objectFit: "contain", objectPosition: "left", maxWidth: 380 }} alt="" />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 84,
                height: 84,
                borderRadius: 22,
                background: "linear-gradient(160deg, #F1BE4B 0%, #C99527 100%)",
                color: "#171310",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              TS.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 100,
                border: "1px solid rgba(245,129,31,0.5)",
                background: "rgba(245,129,31,0.12)",
                fontSize: 21,
                fontWeight: 700,
                color: "#FBD9B0",
                marginBottom: 26,
              }}
            >
              {category}
            </div>
            <div
              style={{
                fontSize: title.length > 70 ? 44 : 52,
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: -0.5,
              }}
            >
              {title.length > 110 ? `${title.slice(0, 109)}…` : title}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <div style={{ display: "flex", width: 34, height: 2, background: "#F5811F" }} />
            www.trevys.fr/blog
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
