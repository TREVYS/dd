"use client";

import { useActionState, useMemo } from "react";
import { submitContact, type ContactState } from "./actions";

const initial: ContactState = { ok: false, message: "" };

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg2)",
  border: "1px solid var(--line)",
  borderRadius: "14px",
  padding: ".9rem 1.05rem",
  font: "inherit",
  fontSize: ".9rem",
  color: "var(--ink)",
};

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const openedAt = useMemo(() => Date.now(), []);

  return (
    <form
      action={action}
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "32px",
        padding: "2.6rem",
        boxShadow: "var(--glass-sh)",
      }}
    >
      <input type="hidden" name="_t" value={openedAt} />
      {/* Honeypot anti-bot : caché aux humains */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <label>Ne pas remplir</label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>Prénom</span>
          <input name="firstName" required placeholder="Prénom" style={fieldStyle} />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>Nom</span>
          <input name="lastName" required placeholder="Nom" style={fieldStyle} />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>E-mail professionnel</span>
          <input type="email" name="email" required placeholder="vous@entreprise.fr" style={fieldStyle} />
        </label>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>Téléphone</span>
          <input type="tel" name="phone" placeholder="06 12 34 56 78" style={fieldStyle} />
        </label>
      </div>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>Votre besoin</span>
        <select name="subject" style={fieldStyle} defaultValue="Expertise comptable">
          <option>Expertise comptable</option>
          <option>Consulting &amp; transformation</option>
          <option>Facturation électronique</option>
          <option>Autre demande</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={{ display: "block", fontSize: ".8rem", color: "var(--ink2)", marginBottom: ".45rem", fontWeight: 600 }}>Votre message</span>
        <textarea name="message" required placeholder="Décrivez-nous votre entreprise et votre projet…" style={{ ...fieldStyle, minHeight: 120, resize: "vertical" }} />
      </label>

      <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>

      {state.message && (
        <p
          role="status"
          style={{
            marginTop: "1rem",
            fontSize: ".88rem",
            textAlign: "center",
            fontWeight: 600,
            color: state.ok ? "var(--violet)" : "#c0392b",
          }}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
