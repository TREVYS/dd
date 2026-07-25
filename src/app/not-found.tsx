import Link from "next/link";
import type { Metadata } from "next";
import "./(marketing)/marketing.css";
import { LostMascots } from "./(marketing)/_components/lost-mascots";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mkt">
      <section className="sec" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <div className="wrap" style={{ textAlign: "center", maxWidth: 620 }}>
          <LostMascots />
          <span className="eyebrow" style={{ display: "inline-block", marginTop: "1.2rem" }}>Erreur 404</span>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", margin: ".6rem 0 1rem" }}>
            Cette page a <em>perdu la baguette</em>
          </h1>
          <p style={{ color: "var(--ink2)", lineHeight: 1.7, margin: "0 auto 2rem", maxWidth: "46ch" }}>
            La partition que vous cherchez s&apos;est égarée. La page a
            peut-être été déplacée, ou l&apos;adresse comporte une coquille.
          </p>
          <div className="mkt-act" style={{ justifyContent: "center" }}>
            <Link className="btn btn-gold" href="/">Retour à l&apos;accueil</Link>
            <Link className="btn btn-ghost" href="/blog">Voir les ressources</Link>
          </div>
          <p style={{ marginTop: "1.6rem", fontSize: ".9rem", color: "var(--ink3)" }}>
            Besoin d&apos;aide ? <Link href="/contact" style={{ color: "var(--violet)", fontWeight: 600 }}>Contactez-nous</Link>{" "}
            ou <Link href="/rendez-vous" style={{ color: "var(--violet)", fontWeight: 600 }}>prenez rendez-vous</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
