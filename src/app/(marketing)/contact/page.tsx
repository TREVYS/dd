import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { WhatsappButton, WA_DISPLAY } from "../_components/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Trevys Advisory : +33 7 68 05 04 65 — contact@trevys-advisory.fr — 1 rue Le Nôtre, 75116 Paris.",
  alternates: { canonical: "/contact" },
};

const WAYS = [
  { l: "Téléphone / WhatsApp", v: WA_DISPLAY },
  { l: "E-mail", v: "contact@trevys-advisory.fr" },
  { l: "Adresse", v: "1 rue Le Nôtre, 75116 Paris" },
  { l: "Rendez-vous", v: "En cabinet ou à distance" },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Contact</span>
          <h1>Nous sommes là pour <em>vous</em></h1>
          <p>
            Un projet, une question, une envie de changer de cabinet ?
            Écrivez-nous ou appelez-nous : nous vous répondons rapidement.
          </p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.1fr",
              gap: "4rem",
              alignItems: "start",
            }}
            className="mkt-contact-grid"
          >
            <div>
              <h3 style={{ fontSize: "1.6rem", marginBottom: "1.1rem" }}>
                Parlons de votre entreprise
              </h3>
              <p style={{ color: "var(--ink2)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "42ch" }}>
                Chaque nouvelle collaboration commence par un échange, sans
                engagement, pour comprendre vos enjeux.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {WAYS.map((w) => (
                  <div key={w.l}>
                    <div style={{ fontSize: ".74rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)", fontWeight: 600 }}>
                      {w.l}
                    </div>
                    <div style={{ fontSize: ".98rem", color: "var(--ink)", marginTop: ".15rem", fontWeight: 500 }}>
                      {w.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mkt-wa-hint" style={{ marginTop: "1.8rem" }}>
                <span>Plutôt WhatsApp ? Écrivez-nous, on répond vite 👋</span>
                <WhatsappButton context="contact" />
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
