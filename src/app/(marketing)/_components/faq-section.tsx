import { SITE_URL } from "@/lib/site";

export type FaqItem = { q: string; a: string };

// Section « Questions fréquentes » + données structurées FAQPage : les moteurs
// (Google comme les IA) peuvent citer directement ces questions/réponses.
export function FaqSection({
  items,
  titre = "Questions fréquentes",
  intro,
  path,
}: {
  items: FaqItem[];
  titre?: string;
  intro?: React.ReactNode;
  path?: string; // page porteuse, pour identifier le bloc dans le graphe
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(path ? { "@id": `${SITE_URL}${path}#faq` } : {}),
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">{titre}</span>
            {intro}
          </div>
          <div className="mkt-faq">
            {items.map((f) => (
              <details key={f.q} className="mkt-faq-item">
                <summary>
                  {f.q}
                  <span className="mkt-faq-plus" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
