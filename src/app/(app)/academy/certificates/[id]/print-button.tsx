"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mt-6 bg-brand text-white rounded-xl px-5 py-2 text-sm font-medium print:hidden"
    >
      Imprimer / PDF
    </button>
  );
}
