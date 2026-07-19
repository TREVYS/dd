"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "./newsletter-actions";

const initial: NewsletterState = { ok: false, message: "" };

export function Newsletter() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  return (
    <form action={action} className="mkt-news">
      <div className="mkt-news-row">
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 0, height: 0 }}
        />
        <input
          type="email"
          name="email"
          required
          placeholder="Votre e-mail professionnel"
          aria-label="Votre e-mail"
          className="mkt-news-input"
        />
        <button type="submit" className="btn btn-gold btn-sm" disabled={pending}>
          {pending ? "…" : "S'inscrire"}
        </button>
      </div>
      {state.message && (
        <p
          role="status"
          className="mkt-news-msg"
          style={{ color: state.ok ? "var(--violet)" : "#c0392b" }}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
