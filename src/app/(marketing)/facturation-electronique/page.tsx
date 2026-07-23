import type { Metadata } from "next";
import Link from "next/link";
import { TeamPhoto } from "../_components/team-photo";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { RfeFlow } from "./rfe-visuals";

export const metadata: Metadata = {
  title: "Facturation électronique",
  description:
    "Tout savoir sur la réforme de la facturation électronique (2026-2027) : e-invoicing, e-reporting, calendrier, plateformes agréées, format Factur-X. Trevys, chef d'orchestre de votre mise en conformité.",
  alternates: { canonical: "/facturation-electronique" },
};

const STEPS = [
  { n: "01", t: "Analyse d'impact", d: "Cartographie de vos flux de facturation (clients, fournisseurs, B2B, B2C, international) et évaluation des impacts sur votre organisation et vos outils." },
  { n: "02", t: "Organisation & gouvernance", d: "Définition de la cible, des rôles et de la gouvernance des processus de facturation, émission comme réception." },
  { n: "03", t: "Choix de la plateforme (PA)", d: "Sélection objective de la Plateforme Agréée adaptée à votre volumétrie, votre secteur et votre système d'information — en toute indépendance." },
  { n: "04", t: "Intégration & conduite du changement", d: "Raccordement au SI, paramétrage, formation des équipes et déploiement opérationnel jusqu'aux échéances." },
];

const CAL = [
  { d: "1ᵉʳ sept. 2026", t: "Réception obligatoire pour toutes les entreprises", s: "+ émission pour les grandes entreprises et les ETI", on: true },
  { d: "1ᵉʳ sept. 2027", t: "Émission obligatoire pour les PME, TPE et micro-entreprises", s: "Toutes les entreprises assujetties à la TVA sont alors concernées", on: false },
];

const FORMATS = [
  { t: "Factur-X", d: "Le format hybride : un PDF lisible par l'humain, contenant les données structurées. Le plus adapté aux TPE/PME, appelé à devenir la norme." },
  { t: "UBL", d: "Format 100 % structuré (XML), lisible par les machines. Plutôt réservé aux grands volumes et aux systèmes automatisés." },
  { t: "CII", d: "Autre format structuré XML conforme à la norme européenne EN 16931, utilisé dans les échanges automatisés." },
];

const FAQ = [
  {
    q: "Facture électronique ou facture PDF : quelle différence ?",
    a: "Une facture PDF « classique » envoyée par e-mail est une facture dématérialisée, mais pas une facture électronique. La facture électronique respecte une structure de données normée (Factur-X, UBL ou CII) permettant un traitement automatisé de bout en bout, tout en conservant sa valeur probante.",
  },
  {
    q: "Quelle différence entre e-invoicing et e-reporting ?",
    a: "L'e-invoicing concerne l'émission et la réception des factures entre entreprises françaises assujetties à la TVA (B2B). L'e-reporting est la transmission à l'administration des données de transactions non couvertes par la facture électronique : ventes aux particuliers (B2C) et opérations avec l'étranger. Les deux suivent le même calendrier.",
  },
  {
    q: "Mon entreprise est-elle concernée ?",
    a: "Oui, dès lors qu'elle est assujettie à la TVA et établie en France. Toutes les entreprises devront pouvoir recevoir des factures électroniques dès le 1ᵉʳ septembre 2026. L'obligation d'émettre s'applique par vagues, selon la taille de l'entreprise, jusqu'en septembre 2027.",
  },
  {
    q: "Qu'est-ce qu'une Plateforme Agréée (PA) ?",
    a: "Anciennement appelée Plateforme de Dématérialisation Partenaire (PDP), la PA est un opérateur privé immatriculé par l'État. Toute facture B2B devra transiter par une PA. Le choix de la bonne plateforme est une décision structurante — c'est là que notre accompagnement indépendant prend tout son sens.",
  },
  {
    q: "Que devient le Portail Public de Facturation (PPF) ?",
    a: "Le PPF ne transmet plus directement les factures (fin du « schéma en Y »). Il joue désormais le rôle d'annuaire des entreprises et de concentrateur des données de transactions, qu'il relaie à l'administration fiscale.",
  },
  {
    q: "Que faut-il faire dès maintenant ?",
    a: "Cartographier vos flux, vérifier la compatibilité de vos outils, choisir votre plateforme et préparer vos équipes. Anticiper, c'est éviter de subir l'échéance : c'est précisément le rôle que nous jouons à vos côtés.",
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Accueil", path: "/" }, { name: "Facturation électronique" }]} />
      <ServiceJsonLd
        name="Accompagnement à la facturation électronique"
        description="Accompagnement de bout en bout de la réforme de la facturation électronique (RFE) : chef d'orchestre indépendant de votre mise en conformité."
        path="/facturation-electronique"
        serviceType="Facturation électronique"
      />

      <header className="mkt-phead">
        <div className="mkt-phead-in">
          <span className="eyebrow">Facturation électronique</span>
          <h1>Votre <em>chef d&apos;orchestre</em> de la réforme</h1>
          <p>
            La facturation électronique est l&apos;une des plus importantes
            transformations des entreprises françaises. Entre plateformes,
            formats, échéances et outils, nous coordonnons tous les acteurs et
            vous guidons — en toute indépendance — vers une mise en conformité
            sereine et créatrice de valeur.
          </p>
          <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
            <a className="btn btn-gold" href="https://forms.cloud.microsoft/e/mr63uL9LsU" target="_blank" rel="noopener noreferrer">Recevoir le Guide RFE</a>
            <Link className="btn btn-ghost" href="/rendez-vous">Faire le point</Link>
          </div>
        </div>
      </header>

      {/* Comprendre */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Comprendre</span>
            <h2>La facturation électronique, <em>c&apos;est quoi ?</em></h2>
            <p>
              Une facture électronique est une facture dématérialisée de bout en
              bout, dont les données respectent une structure normée par
              l&apos;administration fiscale — permettant un traitement automatisé.
              Attention : un simple PDF envoyé par e-mail n&apos;est pas une
              facture électronique.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <div className="mkt-svc">
              <h3>E-invoicing</h3>
              <p>
                L&apos;émission et la réception de factures électroniques entre
                entreprises françaises assujetties à la TVA (B2B) et avec le
                secteur public (B2G).
              </p>
            </div>
            <div className="mkt-svc">
              <h3>E-reporting</h3>
              <p>
                La transmission à l&apos;administration des données de transactions
                non couvertes par la facture électronique : ventes aux particuliers
                (B2C) et opérations avec l&apos;étranger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendrier */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le calendrier</span>
            <h2>Une entrée en vigueur <em>progressive</em></h2>
            <p>L&apos;adoption s&apos;échelonne de 2026 à 2027, selon la taille des entreprises.</p>
          </div>
          <div className="mkt-timeline">
            {CAL.map((c) => (
              <div className={`mkt-tl-item${c.on ? " on" : ""}`} key={c.d}>
                <div className="mkt-tl-dot" />
                <div className="mkt-tl-date">{c.d}</div>
                <div className="mkt-tl-title">{c.t}</div>
                <div className="mkt-tl-sub">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Comment ça marche</span>
            <h2>Le nouveau <em>circuit</em> de la facture</h2>
            <p>
              Fini le « schéma en Y » : toute facture transite désormais par une
              Plateforme Agréée (PA). Le Portail Public de Facturation (PPF)
              devient annuaire et concentrateur des données pour l&apos;administration.
            </p>
          </div>
          <RfeFlow />

          <div className="shead" style={{ marginTop: "3rem" }}>
            <span className="eyebrow">Les formats</span>
            <h2>Trois formats, <em>un standard qui s&apos;impose</em></h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            {FORMATS.map((f) => (
              <div className="mkt-svc" key={f.t}>
                <h3 style={{ fontSize: "1.15rem" }}>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre méthode — chef d'orchestre */}
      <section className="sec band">
        <div className="wrap">
          <div className="mkt-orch">
            <div className="mkt-orch-txt">
              <span className="eyebrow">Notre positionnement</span>
              <h2>Un <em>chef d&apos;orchestre</em>, pas un vendeur de logiciel</h2>
              <p>
                Éditeurs, plateformes agréées, DSI, équipes comptables, dirigeants :
                une mise en conformité réussie fait intervenir de nombreux acteurs.
                Notre rôle est de les <strong>coordonner</strong>.
              </p>
              <p>
                Nous ne vendons aucune plateforme : nous vous aidons à choisir la
                bonne, à l&apos;intégrer à votre système d&apos;information et à
                embarquer vos équipes. Une position <strong>indépendante</strong>,
                au service de votre seul intérêt — avec un regard 360° sur
                l&apos;organisation, les outils, la donnée et la conformité.
              </p>
            </div>
            <ul className="mkt-orch-list">
              <li><b>Indépendance</b><span>Aucun lien commercial avec un éditeur : nos recommandations sont objectives.</span></li>
              <li><b>Vision d&apos;ensemble</b><span>Flux, outils, équipes, échéances : nous tenons tous les fils du projet.</span></li>
              <li><b>Ancrage métier</b><span>Nous parlons le langage de la comptabilité et de la TVA, pas seulement de la technique.</span></li>
            </ul>
          </div>

          <div className="mkt-svc-grid" style={{ marginTop: "2.5rem" }}>
            {STEPS.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <div className="ico">
                  <svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6" /></svg>
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crédibilité fondateur */}
      <section className="sec">
        <div className="wrap">
          <div className="mkt-founder">
            <div className="mkt-founder-media">
              <TeamPhoto
                src="/brand/team/john-levy.jpg"
                initials="JL"
                alt="John Lévy, fondateur de Trevys"
              />
              <div className="mkt-founder-id">
                <div className="nm">John Lévy</div>
                <div className="rl">Fondateur · Expert-comptable</div>
              </div>
            </div>
            <div className="mkt-founder-body">
              <span className="eyebrow">Au cœur de la réforme</span>
              <h2>Un cabinet connecté aux instances qui <em>construisent</em> la réforme</h2>
              <blockquote className="mkt-founder-quote">
                « Je participe activement aux échanges de place autour de la
                facturation électronique. Cet engagement me donne accès aux
                dernières informations — et me permet de porter la voix des
                entreprises auprès des instances qui façonnent la réforme. »
              </blockquote>
              <ul className="mkt-founder-cred">
                <li><span className="k">AFNOR</span> Membre, au sein des travaux de normalisation</li>
                <li><span className="k">Communauté des relais</span> Engagé dès le lancement</li>
                <li><span className="k">Ordre des experts-comptables</span> Élu au Conseil régional de Paris Île-de-France</li>
                <li><span className="k">Relais des enjeux terrain</span> Accès aux dernières informations et transmission des besoins des entreprises</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Questions fréquentes</span>
            <h2>Tout comprendre en <em>quelques réponses</em></h2>
          </div>
          <div className="mkt-faq">
            {FAQ.map((f) => (
              <details className="mkt-faq-item" key={f.q}>
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

      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Où en êtes-vous de la réforme ?</h2>
          <p>Faisons le point sur votre niveau de préparation et bâtissons votre feuille de route.</p>
          <div style={{ display: "flex", gap: ".7rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a className="btn btn-gold" href="https://forms.cloud.microsoft/e/mr63uL9LsU" target="_blank" rel="noopener noreferrer">Recevoir le Guide RFE</a>
            <Link className="btn btn-ghost" href="/rendez-vous">Prendre rendez-vous</Link>
          </div>
        </div>
      </section>
    </>
  );
}
