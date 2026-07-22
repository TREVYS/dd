import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Espace client — bientôt disponible",
  description: "L'espace client Trevys arrive très prochainement.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <section className="sec" style={{ minHeight: "72vh", display: "grid", placeItems: "center" }}>
      <div
        className="mkt-sheet"
        style={{ maxWidth: 640, width: "100%", textAlign: "center", padding: "3.5rem 2.5rem" }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            margin: "0 auto 1.6rem",
            borderRadius: "22px",
            background: "linear-gradient(150deg,#FBB040,#C2410C)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 18px 40px -14px rgba(226,106,15,.6)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
            <path d="M12 2a5 5 0 015 5v3H7V7a5 5 0 015-5zM5 10h14v10H5z" />
          </svg>
        </div>

        <span className="eyebrow" style={{ justifyContent: "center" }}>Espace client</span>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: "1rem 0 1rem", textTransform: "none" }}>
          Bientôt <em>disponible</em>
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 2rem" }}>
          Votre espace client sécurisé — suivi de vos dossiers, documents et échanges
          avec le cabinet — est en cours de déploiement. Il sera accessible ici très
          prochainement.
        </p>

        <div style={{ display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn btn-gold" href="/">Retour à l&apos;accueil</Link>
          <Link className="btn btn-ghost" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </div>
    </section>
  );
}
