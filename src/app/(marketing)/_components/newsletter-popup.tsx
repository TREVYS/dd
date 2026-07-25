"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "./newsletter-actions";

const initial: NewsletterState = { ok: false, message: "" };

// Mémoire locale du visiteur : déjà inscrit → plus jamais de popup auto ;
// popup déjà proposé → on attend 30 jours avant de le reproposer.
const SEEN_KEY = "trevys-news-seen";
const SUB_KEY = "trevys-news-sub";
const SEEN_TTL = 30 * 24 * 3600 * 1000; // 30 jours

function shouldAutoOpen(): boolean {
  try {
    if (localStorage.getItem(SUB_KEY)) return false;
    const seen = Number(localStorage.getItem(SEEN_KEY) ?? 0);
    return !seen || Date.now() - seen > SEEN_TTL;
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, String(Date.now()));
  } catch { /* stockage indisponible */ }
}

// Bouton d'appel + popup d'inscription à la newsletter. Le popup s'ouvre
// aussi tout seul (une fois par mois maximum) : après 30 s de lecture, ou
// quand la souris quitte la page vers le haut (intention de sortie, PC).
export function NewsletterPopup({ label = "S'inscrire à la newsletter" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  // Inscription réussie → on ne reproposera plus jamais le popup automatique.
  useEffect(() => {
    if (state.ok) {
      try {
        localStorage.setItem(SUB_KEY, "1");
      } catch { /* stockage indisponible */ }
    }
  }, [state.ok]);

  // Ouverture automatique : 30 s de lecture OU intention de sortie (desktop).
  useEffect(() => {
    if (!shouldAutoOpen()) return;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      markSeen();
      setOpen(true);
      cleanup();
    };
    const timer = window.setTimeout(fire, 30_000);
    const onLeave = (e: MouseEvent) => {
      // Souris qui file vers le haut de la fenêtre = départ probable.
      if (e.clientY <= 0) fire();
    };
    document.addEventListener("mouseout", onLeave);
    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
    }
    return cleanup;
  }, []);

  // Échap pour fermer + blocage du défilement derrière le popup.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" className="btn btn-gold mkt-newspop-cta" onClick={() => setOpen(true)}>
        {label}
      </button>

      {open && (
        <div className="mkt-newspop-overlay" onClick={() => setOpen(false)}>
          <div
            className="mkt-newspop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="newspop-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="mkt-newspop-close"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            {state.ok ? (
              <div className="mkt-newspop-done">
                <div className="ic">🎉</div>
                <h3>Merci, c&apos;est noté !</h3>
                <p>{state.message || "Vous recevrez nos prochaines analyses par e-mail."}</p>
                <button type="button" className="btn btn-gold" onClick={() => setOpen(false)}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <span className="eyebrow">Newsletter</span>
                <h3 id="newspop-title">Recevez nos analyses</h3>
                <p className="mkt-newspop-sub">
                  Décryptages sur la réforme de la facturation électronique, la
                  fiscalité et l&apos;innovation comptable. Une inscription, pas
                  de spam, désinscription en un clic.
                </p>
                <form action={action} className="mkt-newspop-form">
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
                    autoFocus
                    placeholder="Votre e-mail professionnel"
                    aria-label="Votre e-mail"
                  />
                  <button type="submit" className="btn btn-gold" disabled={pending}>
                    {pending ? "Inscription…" : "Je m'inscris"}
                  </button>
                </form>
                {state.message && !state.ok && (
                  <p role="status" className="mkt-newspop-err">{state.message}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
