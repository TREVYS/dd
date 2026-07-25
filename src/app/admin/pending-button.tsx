"use client";

import { useFormStatus } from "react-dom";

// Bouton de formulaire avec retour visuel : pendant l'action serveur, le
// libellé change et un petit anneau tourne — on sait qu'Alfred travaille.
export function PendingButton({
  children,
  pendingLabel = "Un instant…",
  className = "adm-btn",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending}>
      {pending && <span className="adm-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
