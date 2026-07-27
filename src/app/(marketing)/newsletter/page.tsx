import type { Metadata } from "next";
import Link from "next/link";
import { Newsletter } from "../_components/newsletter";

export const metadata: Metadata = {
  title: "S'inscrire à la newsletter — Trevys",
  description:
    "Recevez les analyses de T.A. Trevys Advisory : facturation électronique, fiscalité, innovation — l'essentiel, sans jargon et sans spam.",
  alternates: { canonical: "/newsletter" },
};

// Page d'inscription dédiée : l'adresse propre à partager (signature d'e-mail,
// LinkedIn, QR code…) — www.trevys.fr/newsletter
export default function NewsletterPage() {
  return (
    <section className="sec">
      <div className="wrap" style={{ maxWidth: 620, textAlign: "center", padding: "4.5rem 1rem" }}>
        <p className="eyebrow">Newsletter</p>
        <h1 style={{ fontSize: "2rem", lineHeight: 1.25, marginBottom: "1rem" }}>
          Nos analyses, directement dans votre boîte mail
        </h1>
        <p style={{ color: "var(--ink2)", lineHeight: 1.75, marginBottom: "2rem" }}>
          Facturation électronique, fiscalité, innovation, vie des entreprises : l&apos;essentiel,
          expliqué sans jargon par les équipes de T.A. Trevys Advisory. Quelques envois par
          trimestre — jamais de spam, désinscription en un clic.
        </p>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <Newsletter />
        </div>
        <p style={{ color: "var(--ink3)", fontSize: ".85rem", marginTop: "2.4rem" }}>
          Envie d&apos;un aperçu ? Parcourez nos <Link href="/blog">dernières analyses</Link>.
        </p>
      </div>
    </section>
  );
}
