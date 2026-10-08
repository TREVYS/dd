import type { Metadata } from "next";
import Link from "next/link";
import { WhatsappButton, WA_DISPLAY } from "../../(marketing)/_components/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Trevys Advisory: +33 7 68 05 04 65 — contact@trevys-advisory.fr — 1 rue Le Nôtre, 75016 Paris.",
  alternates: { canonical: "/en/contact", languages: { fr: "https://www.trevys.fr/contact" } },
};

const WAYS = [
  { l: "Phone / WhatsApp", v: WA_DISPLAY },
  { l: "Email", v: "contact@trevys-advisory.fr" },
  { l: "Address", v: "1 rue Le Nôtre, 75016 Paris, France" },
  { l: "Meetings", v: "At our office or remotely" },
];

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Contact</span>
          <h1>We&apos;re here for <em>you</em></h1>
          <p>A project, a question, thinking of switching accountants? Write or call us: we reply quickly.</p>
        </div>
      </header>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h3 style={{ fontSize: "1.6rem", marginBottom: "1.1rem" }}>Let&apos;s talk about your company</h3>
            <p style={{ color: "var(--ink2)", lineHeight: 1.7, marginBottom: "2rem" }}>
              Every new relationship starts with a no-obligation conversation, to understand your needs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {WAYS.map((w) => (
                <div key={w.l}>
                  <div style={{ fontSize: ".74rem", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink3)", fontWeight: 600 }}>{w.l}</div>
                  <div style={{ fontSize: ".98rem", color: "var(--ink)", marginTop: ".15rem", fontWeight: 500 }}>{w.v}</div>
                </div>
              ))}
            </div>
            <div className="mkt-wa-hint" style={{ marginTop: "1.8rem" }}>
              <span>Prefer WhatsApp? Message us, we reply fast 👋</span>
              <WhatsappButton context="contact" />
            </div>
            <p style={{ marginTop: "2.2rem", fontSize: ".9rem", color: "var(--ink2)" }}>
              Prefer a form? <Link href="/contact" style={{ color: "var(--violet)", fontWeight: 700 }}>Our contact form</Link> is quick to fill in (in French, but a message in English is perfectly fine too).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
