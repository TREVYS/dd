"use client";

import { useActionState } from "react";
import { submitApplication, type ApplyState } from "./actions";

const initial: ApplyState = { ok: false, message: "" };

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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: ".8rem",
  color: "var(--ink2)",
  marginBottom: ".45rem",
  fontWeight: 600,
};

export function ApplyForm({ jobSlug, jobTitle }: { jobSlug: string; jobTitle: string }) {
  const [state, action, pending] = useActionState(submitApplication, initial);

  if (state.ok) {
    return (
      <div
        className="mkt-contact-form"
        style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 24, padding: "2.2rem", textAlign: "center" }}
      >
        <div style={{ fontSize: "2rem", marginBottom: ".6rem" }}>🎉</div>
        <p style={{ fontWeight: 700, margin: 0 }}>{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mkt-contact-form"
      style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 24, padding: "2.2rem", boxShadow: "var(--glass-sh)" }}
    >
      <input type="hidden" name="jobSlug" value={jobSlug} />
      {/* Honeypot anti-bot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <label>Ne pas remplir</label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mkt-form-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Nom complet</span>
          <input name="name" required placeholder="Prénom Nom" style={fieldStyle} />
        </label>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>E-mail</span>
          <input type="email" name="email" required placeholder="vous@exemple.fr" style={fieldStyle} />
        </label>
      </div>
      <div className="mkt-form-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Téléphone <em style={{ fontStyle: "normal", color: "var(--ink3)" }}>(optionnel)</em></span>
          <input type="tel" name="phone" placeholder="06 12 34 56 78" style={fieldStyle} />
        </label>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Profil LinkedIn <em style={{ fontStyle: "normal", color: "var(--ink3)" }}>(optionnel)</em></span>
          <input name="linkedin" placeholder="https://linkedin.com/in/…" style={fieldStyle} />
        </label>
      </div>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={labelStyle}>Votre CV <em style={{ fontStyle: "normal", color: "var(--ink3)" }}>(PDF ou Word, 3 Mo max — obligatoire)</em></span>
        <input type="file" name="cv" required accept=".pdf,.doc,.docx,application/pdf" style={{ ...fieldStyle, padding: ".7rem 1.05rem" }} />
      </label>
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <span style={labelStyle}>Votre message — parcours, motivations, disponibilité</span>
        <textarea
          name="message"
          required
          placeholder={`Quelques lignes sur vous et ce qui vous attire dans le poste « ${jobTitle} »… Vous pouvez y coller un lien vers votre CV.`}
          style={{ ...fieldStyle, minHeight: 140, resize: "vertical" }}
        />
      </label>

      <button type="submit" className="btn btn-gold" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Envoi…" : "Envoyer ma candidature"}
      </button>

      {state.message && !state.ok && (
        <p role="status" style={{ marginTop: "1rem", fontSize: ".88rem", textAlign: "center", fontWeight: 600, color: "#c0392b" }}>
          {state.message}
        </p>
      )}
    </form>
  );
}
