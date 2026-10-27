import type { Metadata } from "next";
import Link from "next/link";
import { getCaseStudy } from "@/lib/case-studies";
import { BreadcrumbJsonLd } from "../../_components/seo-jsonld";

const cs = getCaseStudy("facturation-electronique")!;

export const metadata: Metadata = {
  title: `${cs.h1} — Retour d'expérience`,
  description: cs.chapeau,
  robots: { index: false, follow: true },
};

export default function CaseStudyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Facturation électronique", path: "/facturation-electronique" },
          { name: "Retour d'expérience" },
        ]}
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <nav className="mkt-artcrumb" aria-label="Fil d'Ariane" style={{ marginBottom: "1rem" }}>
            <Link href="/facturation-electronique">← Facturation électronique</Link>
          </nav>
          <span className="eyebrow">{cs.eyebrow}</span>
          <h1>{cs.h1}</h1>
          <p>{cs.chapeau}</p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          {cs.missions.map((m, mi) => (
            <div key={m.client} style={{ marginBottom: mi < cs.missions.length - 1 ? "3rem" : 0 }}>
              <div className="shead" style={{ textAlign: "left", margin: "0 0 1.1rem" }}>
                <h2 style={{ fontSize: "1.4rem" }}>
                  {m.client}
                  {m.context && <span style={{ color: "var(--ink3)", fontWeight: 500, fontSize: "1rem" }}> — {m.context}</span>}
                </h2>
              </div>
              {m.text.map((p, i) => (
                <p key={i} style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem", marginBottom: i < m.text.length - 1 ? "1.1rem" : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Où en êtes-vous de la réforme ?</h2>
          <p>Parlons-en : un premier échange suffit pour cerner vos enjeux et votre calendrier.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
