import type { Metadata } from "next";
import Link from "next/link";
import { OecLogo } from "../_components/oec-logo";
import { TeamPhoto } from "../_components/team-photo";
import { LinkedinLink } from "../_components/linkedin-link";
import { TEAM } from "@/lib/team";

export const metadata: Metadata = {
  title: "Le cabinet",
  description:
    "Fondé en 2018 par John Lévy, Trevys est un cabinet d'expertise comptable et de conseil qui accompagne les dirigeants au-delà de la conformité : mission, valeurs, équipe.",
  alternates: { canonical: "/le-cabinet" },
};

const VALUES = [
  { t: "Engagement", d: "Nous nous impliquons pleinement dans chaque mission, avec le même niveau d'exigence, quelle que soit sa taille." },
  { t: "Excellence", d: "Nous recherchons en permanence la qualité, la précision et la fiabilité de nos travaux." },
  { t: "Innovation", d: "Nous faisons évoluer nos méthodes, nos outils et nos compétences pour des solutions toujours plus performantes." },
  { t: "Proximité", d: "Nous construisons des relations durables fondées sur l'écoute, la disponibilité et la confiance." },
  { t: "Transmission", d: "Nous partageons nos connaissances pour aider nos clients à mieux comprendre leurs enjeux et à décider." },
];

const GENESE = [
  "Tout commence en 2018. Après plusieurs années passées au sein de cabinets et de directions financières, John Lévy fait un constat simple : les dirigeants n'ont pas seulement besoin d'un cabinet qui produit des comptes, mais d'un partenaire qui les éclaire dans leurs décisions.",
  "Trevys naît de cette conviction. Le cabinet se construit autour de deux métiers indissociables — l'expertise comptable et le conseil — avec l'ambition d'accompagner les entreprises au-delà de la conformité : dans leurs transformations, leur pilotage et leur croissance.",
  "Au fil des années, le cabinet s'entoure d'un écosystème de sociétés et d'experts complémentaires, et fait le pari de la technologie — data, automatisation, intelligence artificielle — pour augmenter la valeur délivrée à ses clients, sans jamais perdre de vue l'essentiel : la relation humaine et la confiance.",
];

const CRED = [
  "Élu au Conseil régional de l'Ordre des experts-comptables Paris Île-de-France.",
  "Référent sur les sujets de facturation électronique et de transformation numérique.",
  "Intervenant régulier auprès d'organisations professionnelles et de directions financières.",
  "Enseignant en Master CCA, engagé dans l'évolution de la profession.",
];
// Ces engagements sont portés par le fondateur du cabinet.

export default function Page() {
  return (
    <>
      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Le cabinet</span>
          <h1>Bien plus qu&apos;un <em>cabinet</em> d&apos;expertise comptable</h1>
          <p>
            Fondé en 2018, Trevys accompagne les dirigeants au-delà de la
            conformité : dans leurs décisions, leurs transformations et leur
            développement. Deux métiers, une même ambition — créer durablement de
            la valeur.
          </p>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre genèse</span>
            <h2>L&apos;histoire d&apos;un cabinet <em>augmenté</em></h2>
          </div>
          <div className="mkt-genese">
            {GENESE.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="mkt-genese-stats">
              <div><b>2018</b><span>Création du cabinet</span></div>
              <div><b>2 métiers</b><span>Expertise comptable &amp; conseil</span></div>
              <div><b>1 écosystème</b><span>De sociétés &amp; d&apos;experts</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos valeurs</span>
            <h2>Les valeurs qui nous <em>animent</em></h2>
          </div>
          <div className="mkt-svc-grid">
            {VALUES.map((v) => (
              <div className="mkt-svc" key={v.t}>
                <h3>{v.t}</h3>
                <p>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Une expertise reconnue</span>
            <h2>Une légitimité au service de la <em>profession</em></h2>
            <p>
              Notre fondateur, <strong>John Lévy</strong>, expert-comptable,
              s&apos;engage activement dans la vie de la profession :
            </p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".9rem", maxWidth: "760px" }}>
            {CRED.map((c) => (
              <li key={c} style={{ display: "flex", gap: ".8rem", color: "var(--ink2)" }}>
                <span style={{ color: "var(--violet)", fontWeight: 800 }}>✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "2.2rem" }}>
            <OecLogo className="mkt-oec" />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le mot du fondateur</span>
          </div>
          <figure className="mkt-fq">
            <blockquote>
              Lorsque j&apos;ai créé Trevys, je ne voulais pas construire un
              cabinet d&apos;expertise comptable supplémentaire. Je voulais un
              cabinet capable d&apos;accompagner les dirigeants face aux
              transformations profondes de leur environnement. Les attentes ont
              changé, les métiers évoluent, les technologies ouvrent de nouvelles
              perspectives. Notre rôle est d&apos;aider les entreprises à en
              tirer parti, sans jamais perdre de vue l&apos;essentiel : la
              relation humaine, le conseil et la confiance.
            </blockquote>
            <figcaption>
              <TeamPhoto src={TEAM.find((m) => m.slug === "john-levy")?.photo ?? "/brand/team/john-levy.jpg"} initials="JL" alt="John Lévy" />
              <span>
                <strong>John Lévy</strong>
                <em>Fondateur — Expert-comptable</em>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">L&apos;équipe</span>
            <h2>Les femmes et les hommes de <em>Trevys</em></h2>
          </div>
          <div className="mkt-team">
            {TEAM.map((m) => (
              <div className="mkt-team-card mkt-consultant" key={m.slug}>
                <TeamPhoto src={m.photo} initials={m.initials} alt={m.name} />
                <div className="mkt-team-body">
                  <div className="nm">{m.firstName}</div>
                  <div className="rl">{m.role}</div>
                  <div className="mkt-team-apport">{m.apport}</div>
                  <div className="mkt-team-foot">
                    <Link className="mkt-consultant-more mkt-stretch" href={`/le-cabinet/${m.slug}`}><span className="mkt-more-txt">En savoir plus </span>→</Link>
                    <LinkedinLink href={m.linkedin} name={m.firstName} className="mkt-li-ic" compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Rencontrons-nous.</h2>
          <p>La meilleure façon de comprendre Trevys, c&apos;est encore d&apos;échanger de vive voix.</p>
          <Link className="btn btn-gold" href="/contact">Nous contacter</Link>
        </div>
      </section>
    </>
  );
}
