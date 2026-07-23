import type { Metadata } from "next";
import Script from "next/script";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Réservez un premier échange de 15 minutes avec Trevys Advisory pour comprendre vos besoins. Cabinet d'expertise comptable & de conseil à Paris.",
  alternates: { canonical: "/rendez-vous" },
};

export const dynamic = "force-dynamic";
const CALENDLY_URL =
  getSetting("calendlyUrl") ?? "https://calendly.com/trevys-advisory/15min";

import { WhatsappButton, WA_DISPLAY } from "../_components/whatsapp";

const WAYS = [
  { l: "Téléphone / WhatsApp", v: WA_DISPLAY },
  { l: "E-mail", v: "contact@trevys-advisory.fr" },
  { l: "Adresse", v: "13 avenue Bugeaud, 75116 Paris" },
  { l: "Horaires", v: "Sur rendez-vous, en cabinet ou à distance" },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Prendre rendez-vous</span>
          <h1>15 minutes pour comprendre vos <em>besoins</em></h1>
          <p>
            Choisissez un créneau qui vous convient pour un premier échange
            téléphonique, sans engagement. Nous ferons connaissance et
            identifierons comment Trevys peut vous être utile.
          </p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="mkt-rdv">
            <aside className="mkt-rdv-info">
              <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
                Le cabinet
              </h2>
              <p style={{ color: "var(--ink2)", lineHeight: 1.7, marginBottom: "1.4rem" }}>
                Trevys Advisory — cabinet d&apos;expertise comptable &amp; de
                conseil, membre de l&apos;Ordre des Experts-Comptables.
              </p>
              <div className="mkt-wa-hint">
                <span>Plutôt WhatsApp ? Écrivez-nous, on répond vite 👋</span>
                <WhatsappButton context="rdv" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginTop: "1.8rem" }}>
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
            </aside>

            <div className="mkt-rdv-embed">
              <link rel="preconnect" href="https://assets.calendly.com" />
              <div
                className="calendly-inline-widget mkt-cal"
                data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=e26a0f`}
                data-resize="true"
              />
              <Script
                src="https://assets.calendly.com/assets/external/widget.js"
                strategy="afterInteractive"
              />
              <noscript>
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <a href={CALENDLY_URL} className="btn btn-gold" target="_blank" rel="noopener">
                    Ouvrir le calendrier de rendez-vous
                  </a>
                </div>
              </noscript>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
