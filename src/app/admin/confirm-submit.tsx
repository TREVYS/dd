"use client";

// Bouton d'envoi avec garde-fou : si un message est fourni, une confirmation
// humaine (pop-up) est exigée avant de soumettre le formulaire.
export function ConfirmSubmit({
  message,
  className = "adm-btn",
  children,
}: {
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      type="submit"
      onClick={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
