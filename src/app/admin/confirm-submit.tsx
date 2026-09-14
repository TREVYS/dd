"use client";

import { useFormStatus } from "react-dom";

// Bouton d'envoi avec garde-fou : si un message est fourni, une confirmation
// humaine (pop-up) est exigée avant de soumettre le formulaire. Se désactive
// pendant l'envoi pour empêcher tout double clic (source de doublons).
export function ConfirmSubmit({
  message,
  className = "adm-btn",
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {pending ? "Envoi en cours…" : children}
    </button>
  );
}
