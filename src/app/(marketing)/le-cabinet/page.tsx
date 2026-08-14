import type { Metadata } from "next";
import Link from "next/link";
import { OecLogo } from "../_components/oec-logo";
import { TeamPhoto } from "../_components/team-photo";
import { getPeoplePhoto } from "@/lib/people-photos";

export const dynamic = "force-dynamic";
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

// L'histoire du cabinet, racontée comme une trajectoire.
const HISTOIRE = [
  {
    annee: "2018",
    titre: "Une conviction devient un cabinet",
    texte: "Après des années passées en cabinets et en directions financières, John Lévy fait un constat têtu : les dirigeants ne manquent pas de comptes, ils manquent d'éclairage. Trevys naît rue Le Nôtre, avec une promesse simple — le chiffre juste, mis au service de la décision.",
  },
  {
    annee: "2020",
    titre: "Deux métiers, une seule maison",
    texte: "Le conseil rejoint l'expertise comptable, non pas à côté mais avec elle : les consultants travaillent sur les chiffres réels, les comptables comprennent la stratégie. Cette articulation, rare dans la profession, devient la signature du cabinet.",
  },
  {
    annee: "2023",
    titre: "Un écosystème s'assemble",
    texte: "Autour du cabinet se constitue un cercle de sociétés et d'experts complémentaires — data, droit social, audit, édition logicielle. Une réponse complète, sans jamais diluer la responsabilité : un interlocuteur, une exigence.",
  },
  {
    annee: "2026",
    titre: "Le pari de la technologie, tenu",
    texte: "Automatisation, intelligence artificielle, facturation électronique : le cabinet met la technologie au travail — pour rendre du temps aux équipes et de la clarté aux clients. Référent sur la réforme, il aide la profession elle-même à franchir le cap.",
  },
];

// Le manifeste : ce qui fait la manière Trevys.
const PILIERS = [
  {
    titre: "La passion de l'exigence",
    texte: "L'exigence n'est pas une posture, c'est une habitude : relire ce qui semble acquis, vérifier ce que tout le monde tient pour vrai, refuser l'à-peu-près même quand personne ne le verrait. Un dossier Trevys doit pouvoir être ouvert par n'importe qui, n'importe quand, sans rougir.",
  },
  {
    titre: "Le goût de la précision",
    texte: "Un chiffre n'est pas presque juste : il est juste, ou il ne sert à rien. La précision est ce qui transforme une comptabilité en outil de décision — des marges que l'on peut comparer, une trésorerie que l'on peut projeter, un résultat que l'on peut expliquer ligne à ligne.",
  },
  {
    titre: "Le sens du service",
    texte: "Répondre. Vite, clairement, et à la question posée. Derrière chaque demande, il y a un dirigeant qui doit trancher : notre travail est de lui rendre la décision plus facile — pas de lui renvoyer la complexité avec un vocabulaire en plus.",
  },
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
            <span className="eyebrow">Notre histoire</span>
            <h2>Une trajectoire, pas un <em>hasard</em></h2>
            <p>
              Trevys ne s&apos;est pas construit en un jour : chaque étape a ajouté
              une brique à la même ambition — mettre le chiffre au service de la décision.
            </p>
          </div>
          <ol className="mkt-histoire">
            {HISTOIRE.map((h) => (
              <li key={h.annee}>
                <span className="year">{h.annee}</span>
                <div className="body">
                  <h3>{h.titre}</h3>
                  <p>{h.texte}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mkt-genese-stats" style={{ maxWidth: 860, margin: "2.4rem auto 0" }}>
            <div><b>2018</b><span>Création du cabinet, Paris 16ᵉ</span></div>
            <div><b>2 métiers</b><span>Expertise comptable &amp; conseil, indissociables</span></div>
            <div><b>1 écosystème</b><span>De sociétés &amp; d&apos;experts complémentaires</span></div>
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre manière</span>
            <h2>Ce qui nous fait <em>lever le matin</em></h2>
            <p>
              Trois exigences, cultivées comme un artisanat — elles valent
              mieux qu&apos;un long discours commercial.
            </p>
          </div>
          <div className="mkt-loc-grid">
            {PILIERS.map((pl, i) => (
              <div key={pl.titre} className="mkt-loc-card">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{pl.titre}</h3>
                <p>{pl.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos valeurs</span>
            <h2>Les valeurs qui nous <em>animent</em></h2>
          </div>
          <div className="mkt-grid5">
            {VALUES.map((v, i) => (
              <div className="mkt-loc-card" key={v.t}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
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
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: ".9rem", maxWidth: "620px", margin: "0 auto" }}>
            {CRED.map((c) => (
              <li key={c} style={{ display: "flex", gap: ".8rem", color: "var(--ink2)" }}>
                <span style={{ color: "var(--violet)", fontWeight: 800 }}>✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "2.2rem", display: "flex", justifyContent: "center" }}>
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
              <TeamPhoto src={getPeoplePhoto("john-levy") ?? TEAM.find((m) => m.slug === "john-levy")?.photo ?? "/brand/team/john-levy.jpg"} initials="JL" alt="John Lévy" />
              <span>
                <strong>John Lévy</strong>
                <em>Fondateur — Expert-comptable</em>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le service, concrètement</span>
            <h2>Des engagements que l&apos;on peut <em>vérifier</em></h2>
          </div>
          <div className="mkt-loc-stats" style={{ maxWidth: 1000, gridTemplateColumns: "repeat(4,1fr)" }}>
            <div><b>24 h</b><span>pour une première réponse, les jours ouvrés</span></div>
            <div><b>3 mois</b><span>maximum entre clôture et présentation des comptes</span></div>
            <div><b>1 visage</b><span>un interlocuteur dédié, le même dans la durée</span></div>
            <div><b>9 h – 19 h</b><span>joignables du lundi au vendredi, sur place ou en visio</span></div>
          </div>
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
                <TeamPhoto src={getPeoplePhoto(m.slug) ?? m.photo} initials={m.initials} alt={m.name} />
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
