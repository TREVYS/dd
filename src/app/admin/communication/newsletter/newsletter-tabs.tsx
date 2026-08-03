import Link from "next/link";

export type NlVue = "inscrits" | "preparation" | "suivi";

const TABS: { id: NlVue; label: string }[] = [
  { id: "inscrits", label: "Inscriptions" },
  { id: "preparation", label: "Préparation des envois" },
  { id: "suivi", label: "Suivi des envois" },
];

// Onglets du module Newsletter : chaque vue ne montre que ce qui la concerne.
export function NewsletterTabs({ vue, counts }: { vue: NlVue; counts: Record<NlVue, number> }) {
  return (
    <div className="nl-tabs">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={`/admin/communication/newsletter?vue=${t.id}`}
          className={`nl-tab${vue === t.id ? " on" : ""}`}
        >
          {t.label}
          {counts[t.id] > 0 && <span className="n">{counts[t.id]}</span>}
        </Link>
      ))}
    </div>
  );
}
