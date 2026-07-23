import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { AiRobot } from "../_components/ai-robot";

export const metadata: Metadata = {
  title: "Intelligence artificielle",
  description:
    "Du conseil en transformation digitale à l'expertise IA : Trevys accompagne l'intégration de solutions et de briques d'intelligence artificielle avec un regard 360° (sécurité IT, architecture, RAG, stockage des données), sous contrôle humain permanent.",
  alternates: { canonical: "/intelligence-artificielle" },
};

const CARDS = [
  { t: "Une valeur d'abord", d: "Aucune technologie pour la technologie : nous l'intégrons uniquement quand elle sert le client." },
  { t: "Contrôle humain", d: "L'expert valide et arbitre. L'IA propose, le professionnel décide." },
  { t: "Transparence", d: "Des usages explicables et documentés, au service de la qualité et de la sérénité." },
];

// Notre regard 360° sur un projet d'IA.
const SCOPE = [
  {
    t: "Sécurité IT & conformité",
    d: "Protection des données sensibles, gestion des accès, RGPD, souveraineté : l'IA ne doit jamais ouvrir une brèche.",
    icon: "M12 2l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V5l8-3z",
  },
  {
    t: "Architecture & intégration",
    d: "Nous connectons les briques IA à votre SI existant (ERP, métier, outils) proprement, sans dette technique.",
    icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  },
  {
    t: "RAG & bases de connaissances",
    d: "Recherche augmentée sur vos propres documents : des réponses fiables, sourcées et à jour, pas des hallucinations.",
    icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2zM14 3v5h5",
  },
  {
    t: "Stockage & données",
    d: "Structuration, qualité et gouvernance de la donnée — le vrai carburant d'une IA performante et maîtrisée.",
    icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  },
  {
    t: "Choix & intégration de solutions",
    d: "Sélection des bons outils (éditeurs, modèles, briques open source) et intégration au plus près de vos usages.",
    icon: "M12 2a3 3 0 013 3 4 4 0 014 4 3 3 0 010 6 4 4 0 01-4 4 3 3 0 01-6 0 4 4 0 01-4-4 3 3 0 010-6 4 4 0 014-4 3 3 0 013-3z",
  },
  {
    t: "Gouvernance & conduite du changement",
    d: "Cadre d'usage, formation des équipes, adoption : une IA utile est une IA réellement utilisée.",
    icon: "M16 11a4 4 0 10-8 0M2 21a8 8 0 0120 0M12 3v0",
  },
];

const USECASES = [
  { t: "CRM pour avocats", d: "Conception et déploiement d'un CRM métier adapté aux cabinets d'avocats." },
  { t: "CRM pour experts-comptables", d: "Un CRM sur mesure pour la relation client et le pilotage d'un cabinet d'expertise comptable." },
  { t: "Matching de compétences (ESN)", d: "Outil d'appariement des compétences pour optimiser le staffing d'une ESN." },
  { t: "Analyse des compétences & mobilité interne", d: "Outil d'analyse des compétences au service des mobilités internes d'un grand groupe bancaire." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Intelligence artificielle" }]} />
      <ServiceJsonLd
        name="Solutions d'intelligence artificielle"
        description="Conseil, intégration et déploiement de solutions et de briques d'IA, avec un regard 360° (sécurité, architecture, RAG, données)."
        path="/intelligence-artificielle"
        serviceType="Intelligence artificielle"
      />

      {/* Hero avec robot animé */}
      <header className="mkt-phead mkt-ai-head">
        <div className="mkt-phead-in mkt-ai-hero">
          <div className="mkt-ai-hero-txt">
            <span className="eyebrow">Intelligence artificielle</span>
            <h1>L&apos;IA, prolongement <em>naturel</em> de notre conseil</h1>
            <p>
              Consultants en transformation digitale, nous avons pris le virage
              de l&apos;IA au cœur de nos missions — jusqu&apos;à en faire une
              expertise à part entière. Nous accompagnons l&apos;intégration de
              solutions et de briques d&apos;intelligence artificielle, avec un
              regard 360° sur tous les sujets qui conditionnent leur réussite.
            </p>
            <div className="mkt-ai-hero-cta">
              <Link className="btn btn-gold" href="/rendez-vous">Parler de votre projet IA</Link>
              <Link className="btn btn-ghost" href="/consulting">Voir notre offre conseil</Link>
            </div>
          </div>
          <AiRobot />
        </div>
      </header>

      {/* Récit : du conseil à l'expertise IA */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre parcours</span>
            <h2>Du conseil en transformation à une <em>expertise IA</em></h2>
          </div>
          <div className="mkt-svc-grid">
            <div className="mkt-svc">
              <span className="num">01</span>
              <h3>Un métier de consultants</h3>
              <p>
                Notre cœur d&apos;activité, c&apos;est le conseil en transformation
                digitale : SI Finance, ERP, automatisation, conduite du changement.
                Accompagner les organisations qui évoluent est notre quotidien.
              </p>
            </div>
            <div className="mkt-svc">
              <span className="num">02</span>
              <h3>Le virage de l&apos;IA</h3>
              <p>
                C&apos;est donc naturellement que l&apos;IA s&apos;est invitée dans
                nos missions. Nous l&apos;avons explorée, éprouvée sur des cas réels,
                puis structurée en une véritable expertise — pas un effet de mode.
              </p>
            </div>
            <div className="mkt-svc">
              <span className="num">03</span>
              <h3>Un rôle d&apos;intégrateur</h3>
              <p>
                Nous apportons notre soutien à l&apos;intégration de solutions et de
                briques d&apos;IA dans votre environnement, en faisant le lien entre
                le besoin métier, les outils et votre système d&apos;information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regard 360° */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Un regard 360°</span>
            <h2>Nous couvrons <em>tous les angles</em> d&apos;un projet d&apos;IA</h2>
            <p>
              Une IA réussie ne se résume jamais à un modèle. Elle engage la
              sécurité, l&apos;architecture, la donnée et les usages. Nous portons
              une vision complète pour que chaque brique s&apos;intègre sans risque
              ni angle mort.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {SCOPE.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </div>
                <h3 style={{ fontSize: "1.15rem" }}>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cadre de confiance */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Un cadre de confiance</span>
            <h2>Une IA <em>maîtrisée</em> et responsable</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {CARDS.map((c) => (
              <div className="mkt-svc" key={c.t}>
                <h3 style={{ fontSize: "1.2rem" }}>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Réalisations */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos réalisations</span>
            <h2>Des solutions <em>conçues, développées et déployées</em></h2>
            <p>
              Nous participons activement à la conception, au développement et au
              déploiement de solutions logicielles et d&apos;IA pour nos clients.
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg,#FFF7F0,#FFFFFF)",
              border: "1px solid #F5D9BE",
              borderLeft: "4px solid #F5811F",
              borderRadius: "16px",
              padding: "1.75rem 2rem",
              maxWidth: "860px",
              margin: "0 auto 2.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 .75rem" }}>
              Pourquoi confier ces projets à votre expert-comptable&nbsp;?
            </h3>
            <p style={{ margin: 0 }}>
              Parce que la réussite d&apos;un projet logiciel ou d&apos;IA se joue
              d&apos;abord sur la compréhension du <strong>métier</strong>. C&apos;est
              pourquoi <strong>nous intégrons ces projets en tant qu&apos;expert
              métier</strong>&nbsp;: qui, mieux que votre expert-comptable, connaît vos
              chiffres, vos processus, vos contraintes réglementaires et vos enjeux
              opérationnels&nbsp;? Cette connaissance intime de votre activité nous
              permet de traduire un besoin métier en une solution <strong>juste&nbsp;:
              utile, fiable et réellement adoptée</strong>{" "}par vos équipes. Là où
              d&apos;autres livrent une technologie, <strong>nous intervenons au cœur du
              projet comme référent métier</strong>{" "}et concevons une réponse ancrée dans
              la réalité de votre entreprise — parce que nous la comprenons de
              l&apos;intérieur.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {USECASES.map((u) => (
              <div className="mkt-svc" key={u.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 013 3 4 4 0 014 4 3 3 0 010 6 4 4 0 01-4 4 3 3 0 01-6 0 4 4 0 01-4-4 3 3 0 010-6 4 4 0 014-4 3 3 0 013-3z" /></svg>
                </div>
                <h3 style={{ fontSize: "1.15rem" }}>{u.t}</h3>
                <p>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un cas d&apos;usage en tête ?</h2>
          <p>Voyons ensemble si — et comment — l&apos;IA peut créer une valeur concrète pour votre organisation.</p>
          <Link className="btn btn-gold" href="/rendez-vous">Prendre rendez-vous</Link>
        </div>
      </section>
    </>
  );
}
