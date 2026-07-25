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

const SKILLS = [
  "Comptabilité générale", "Révision", "Fiscalité", "Paie & social",
  "Consolidation", "Audit", "Contrôle de gestion", "SI Finance / ERP",
  "Facturation électronique", "Gestion de projet", "Data / BI", "IA & automatisation",
];
const LANGUAGES = ["Français", "Anglais", "Espagnol", "Allemand", "Italien", "Arabe"];

function ChipGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="mkt-chips">
      {options.map((o) => (
        <label key={o} className="mkt-chip">
          <input type="checkbox" name={name} value={o} />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

export function ApplyForm({ jobSlug, jobTitle }: { jobSlug: string; jobTitle: string }) {
  const [state, action, pending] = useActionState(submitApplication, initial);

  if (state.ok) {
    return (
      <>
        {/* Popup de confirmation, par-dessus la page */}
        <div className="mkt-newspop-overlay">
          <div className="mkt-newspop" role="dialog" aria-modal="true" aria-labelledby="apply-done-title">
            <div className="mkt-newspop-done">
              <div className="ic">🎉</div>
              <h3 id="apply-done-title">Merci, candidature bien reçue !</h3>
              <p>
                Votre dossier pour « {jobTitle} » est entre nos mains. Chaque
                candidature est lue par un associé — vous recevez un accusé de
                réception par e-mail et nous revenons vers vous rapidement.
              </p>
              <a className="btn btn-gold" href="/nous-rejoindre">Retour aux offres</a>
            </div>
          </div>
        </div>
        {/* Encart de confirmation qui reste en place sur la page */}
        <div
          className="mkt-contact-form"
          style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 24, padding: "2.2rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "2rem", marginBottom: ".6rem" }}>🎉</div>
          <p style={{ fontWeight: 700, margin: 0 }}>{state.message}</p>
        </div>
      </>
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
      {/* Profil structuré (façon LinkedIn) */}
      <div className="mkt-form-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Années d&apos;expérience</span>
          <select name="experience" required style={fieldStyle} defaultValue="">
            <option value="" disabled>Choisir…</option>
            <option>0-1 an</option>
            <option>2-3 ans</option>
            <option>4-6 ans</option>
            <option>7-10 ans</option>
            <option>Plus de 10 ans</option>
          </select>
        </label>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Niveau d&apos;études</span>
          <select name="education" required style={fieldStyle} defaultValue="">
            <option value="" disabled>Choisir…</option>
            <option>Bac+2 / Bac+3 (BTS, DCG, licence)</option>
            <option>Bac+5 (Master CCA, DSCG, école)</option>
            <option>DEC / expertise comptable</option>
            <option>Autre</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <span style={labelStyle}>Vos compétences clés <em style={{ fontStyle: "normal", color: "var(--ink3)" }}>(cochez ce qui vous correspond)</em></span>
        <ChipGroup name="skills" options={SKILLS} />
      </div>

      <div className="mkt-form-row2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <div>
          <span style={labelStyle}>Langues pratiquées</span>
          <ChipGroup name="languages" options={LANGUAGES} />
        </div>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Disponibilité</span>
          <select name="availability" required style={fieldStyle} defaultValue="">
            <option value="" disabled>Choisir…</option>
            <option>Immédiate</option>
            <option>Sous 1 mois</option>
            <option>1 à 3 mois</option>
            <option>Plus de 3 mois</option>
          </select>
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
