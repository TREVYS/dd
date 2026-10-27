import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";

export const metadata: Metadata = {
  title: "Formation",
  description:
    "Formation IA et digitalisation pour DAF, directions financières, DSI et experts-comptables — l'Académie IA des cabinets, conçue et délivrée par KLARE STUDIO, organisme de formation certifié Qualiopi.",
  alternates: { canonical: "/formation" },
};

const NIVEAUX = [
  {
    n: "Niveau 1",
    t: "Comprendre & sécuriser",
    d: "Maîtriser les fondamentaux de l'IA, les enjeux pour la profession, le cadre réglementaire et les risques.",
    p: "Associés, managers, collaborateurs",
  },
  {
    n: "Niveau 2",
    t: "Utiliser & déployer",
    d: "Intégrer l'IA générative dans les processus métiers et piloter des projets IA.",
    p: "Managers, collaborateurs, référents IA",
  },
  {
    n: "Niveau 3",
    t: "Transformer le cabinet",
    d: "Faire évoluer les postures vers le conseil augmenté, réorganiser la production et concevoir de nouvelles offres.",
    p: "Associés, managers, collaborateurs",
  },
];

const MODULES = [
  { n: "01", t: "Comprendre l'IA générative et ses applications en cabinet", h: "7 heures" },
  { n: "02", t: "Maîtriser le cadre réglementaire : IA Act, RGPD, déontologie et secret professionnel", h: "7 heures" },
  { n: "03", t: "Sécuriser l'utilisation de l'IA en cabinet", h: "7 heures" },
  { n: "04", t: "Maîtriser l'IA générative et le prompt au quotidien", h: "7 heures" },
  { n: "05", t: "Piloter un projet SI finance et data appliqué à l'IA", h: "7 heures" },
  { n: "06", t: "Analyser, digitaliser et automatiser les processus internes du cabinet", h: "7 heures" },
  { n: "07", t: "Construire et paramétrer ses premiers assistants / agents IA", h: "7 heures" },
  { n: "08", t: "Du collaborateur au « référent client augmenté » par l'IA", h: "14 heures" },
  { n: "09", t: "Repenser l'organisation, les compétences et le modèle économique du cabinet", h: "14 heures" },
  { n: "10", t: "Concevoir et commercialiser de nouvelles missions de conseil grâce à l'IA", h: "7 heures" },
];

const PUBLICS = [
  { t: "DAF & directions financières", d: "Comprendre l'IA, sécuriser son usage et piloter la transformation digitale de la fonction finance." },
  { t: "DSI", d: "Cadrer les projets SI et data, évaluer les outils du marché et déployer des agents IA en toute maîtrise." },
  { t: "Experts-comptables & cabinets", d: "Digitalisation, réglementation, nouvelles missions de conseil et réorganisation du cabinet à l'ère de l'IA." },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Formation" }]} />
      <ServiceJsonLd
        name="Formation IA et digitalisation"
        description="Académie IA des cabinets : formations certifiées Qualiopi pour DAF, directions financières, DSI et experts-comptables, sur la digitalisation, la réglementation et l'IA."
        path="/formation"
        serviceType="Formation professionnelle"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Formation</span>
          <h1>L&apos;<em>Académie IA</em> des cabinets et des directions financières</h1>
          <p>
            Nous formons les DAF, les directions financières, les DSI et les
            experts-comptables aux sujets de digitalisation, de réglementation
            et d&apos;intelligence artificielle. Cette offre est conçue et
            délivrée par <strong>KLARE STUDIO</strong>, l&apos;organisme de
            formation de notre groupe, <strong>certifié Qualiopi</strong>.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <Link className="btn btn-gold" href="/contact?sujet=formation">Exprimer un besoin de formation</Link>
            <Link className="btn btn-ghost" href="/rendez-vous">Prendre rendez-vous</Link>
          </div>
        </div>
      </header>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Qui former</span>
            <h2>Une offre pensée pour <em>chaque fonction</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {PUBLICS.map((s) => (
              <div className="mkt-svc" key={s.t}>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zM23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Trois niveaux de maturité</span>
            <h2>Un parcours <em>progressif</em>, du socle à la transformation</h2>
            <p>
              L&apos;académie s&apos;articule autour de 10 modules capitalisables,
              qui peuvent être suivis individuellement ou dans le cadre d&apos;un
              parcours regroupant les modules choisis.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {NIVEAUX.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
                <p style={{ marginTop: ".6rem", fontSize: ".82rem", color: "var(--ink3)" }}>
                  <strong>Public :</strong> {s.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Catalogue</span>
            <h2>Les <em>10 modules</em> de l&apos;académie</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            {MODULES.map((m) => (
              <div className="mkt-svc" key={m.n}>
                <span className="num">{m.n}</span>
                <h3 style={{ fontSize: "1.05rem" }}>{m.t}</h3>
                <p style={{ fontSize: ".82rem", color: "var(--ink3)" }}>{m.h}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">KLARE STUDIO</span>
            <h2>Un organisme de formation <em>certifié Qualiopi</em></h2>
            <p>
              Conformément à sa démarche qualité, chaque formation est
              dispensée dans le respect du processus pédagogique de KLARE
              STUDIO : positionnement initial, évaluation formative et finale,
              livrables remis à chaque participant. Les formations sont
              accessibles aux personnes en situation de handicap — un référent
              dédié vous accompagne pour toute adaptation nécessaire.
            </p>
          </div>
        </div>
      </section>

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Un besoin de formation à exprimer ?</h2>
          <p>Décrivez-nous vos enjeux : nous construisons avec vous le parcours adapté à votre équipe.</p>
          <Link className="btn btn-gold" href="/contact?sujet=formation">Lancer un besoin de formation</Link>
        </div>
      </section>
    </>
  );
}
