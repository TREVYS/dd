import type { Metadata } from "next";
import Link from "next/link";
import { OecLogo } from "../_components/oec-logo";
import { TeamPhoto } from "../_components/team-photo";

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

const TEAM = [
  { i: "JL", n: "John Lévy", r: "Fondateur · Expert-comptable", photo: "/brand/team/john-levy.jpg" },
  { i: "OB", n: "Olivier Bonnin", r: "Commissaire aux comptes · Data analyste · Transformation digitale", photo: "/brand/team/olivier-bonnin.jpg" },
  { i: "WO", n: "Walther Ottgen", r: "Directeur de l'innovation", photo: "/brand/team/walther-ottgen.jpg" },
  { i: "JR", n: "Jeremy Roch", r: "Directeur commercial", photo: "/brand/team/jeremy-roch.jpg" },
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
              <TeamPhoto src="/brand/team/john-levy.jpg" initials="JL" alt="John Lévy" />
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
              <div className="mkt-team-card" key={m.n}>
                <TeamPhoto src={m.photo} initials={m.i} alt={m.n} />
                <div className="mkt-team-body">
                  <div className="nm">{m.n}</div>
                  <div className="rl">{m.r}</div>
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
