import type { Metadata } from "next";
import Link from "next/link";
import { TeamPhoto } from "../_components/team-photo";
import { BreadcrumbJsonLd, ServiceJsonLd } from "../_components/seo-jsonld";
import { RfeFlow } from "./rfe-visuals";
import { RfeMascot } from "./rfe-mascot";
import { getPeoplePhoto } from "@/lib/people-photos";

// Dynamique : la photo du fondateur (médiathèque) doit suivre les mises à jour.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Facturation électronique",
  description:
    "Tout savoir sur la réforme de la facturation électronique (2026-2027) : e-invoicing, e-reporting, calendrier, plateformes agréées, Factur-X. Trevys, chef d'orchestre de votre mise en conformité — au-delà de la contrainte, un levier de transformation.",
  alternates: { canonical: "/facturation-electronique" },
};

// Notre méthode : la démarche projet en 5 phases (issue de notre parcours RFE).
const METHOD = [
  { n: "01", t: "Cadrage — état des lieux", dur: "2 à 3 semaines", d: "Périmètre, objectifs, gouvernance et risques. Cartographie complète de vos flux (O2C, P2P, clôture), identification des points de friction, matrice RACI et registre des risques." },
  { n: "02", t: "Conception", dur: "4 à 6 semaines", d: "Traduction des besoins en spécifications, conception de l'architecture cible, choix de la plateforme agréée (PA) et schémas d'intégration avec votre SI existant." },
  { n: "03", t: "Réalisation & intégration", dur: "6 à 8 semaines", d: "Paramétrage des connecteurs (ERP ↔ PA), transformation des données (Factur-X, UBL, CII), tests unitaires et de bout en bout, recette et documentation." },
  { n: "04", t: "Déploiement", dur: "3 à 4 semaines", d: "Bascule en production, formation des équipes (DAF, comptables, ADV, IT), support de démarrage et surveillance des premiers flux et rejets." },
  { n: "05", t: "Pilotage & conformité continue", dur: "en continu", d: "Tableau de bord (rejets, délais, statuts), veille réglementaire, ajustement des paramétrages et amélioration continue. « La conformité n'est pas un état, c'est une discipline. »" },
];

const CAL = [
  { d: "1ᵉʳ sept. 2026", t: "Réception obligatoire pour toutes les entreprises", s: "+ émission pour les grandes entreprises et les ETI", on: true },
  { d: "1ᵉʳ sept. 2027", t: "Émission obligatoire pour les PME, TPE et micro-entreprises", s: "Toutes les entreprises assujetties à la TVA sont alors concernées", on: false },
];

// Avancement réel de la réforme — suivi en temps réel (source : DGFiP / AIFE).
const ADVANCE = [
  { d: "Mars 2025", t: "Annuaire en production", s: "Le registre national des entreprises et de leurs plateformes ouvre.", done: true },
  { d: "Févr. 2026", t: "Pilote en production", s: "Entreprises et plateformes testent l'envoi réel des flux de données.", done: true },
  { d: "Mars 2026", t: "Ouverture de la sphère publique", s: "Chorus Pro, plateforme de référence pour le secteur public.", done: true },
  { d: "30 juin – 1ᵉʳ juil. 2026", t: "Mise à jour des 3 normes AFNOR", s: "Nouveaux cas d'usage : auto-facture bidirectionnelle, chapitres sectoriels.", done: true },
  { d: "10 juillet 2026", t: "Le ministre confirme le calendrier", s: "David Amiel réaffirme le maintien de la réforme et annonce une « doctrine de démarrage » tolérante et bienveillante.", done: true, hot: true },
  { d: "Été 2026", t: "Publication du décret et de l'arrêté", s: "Textes stabilisés et mise en ligne de la doctrine de démarrage.", done: false },
  { d: "1ᵉʳ sept. 2026", t: "Entrée en vigueur", s: "Réception pour toutes ; émission pour les grandes entreprises et ETI.", done: false, milestone: true },
];

const FLUX = [
  { t: "E-invoicing", d: "Transmettre une facture au format structuré à un client B2B assujetti à la TVA, via une plateforme agréée." },
  { t: "Cycle de vie", d: "Suivre et remonter les statuts d'une facture à chaque étape, de l'émission jusqu'à la mise en paiement." },
  { t: "E-reporting", d: "Transmettre à l'administration les données des transactions hors e-invoicing : B2C, export, certains encaissements." },
  { t: "Annuaire", d: "Consulter le registre national des entreprises et leur code d'adressage, pour router la facture au bon destinataire." },
];

const FORMATS = [
  { t: "Factur-X", d: "Le format hybride : un PDF lisible par l'humain, contenant les données structurées. Le plus adapté aux TPE/PME, appelé à devenir la norme." },
  { t: "UBL", d: "Format 100 % structuré (XML), lisible par les machines. Plutôt réservé aux grands volumes et aux systèmes automatisés." },
  { t: "CII", d: "Autre format structuré XML conforme à la norme européenne EN 16931, utilisé dans les échanges automatisés." },
];

const TAILLE = [
  { t: "Grandes entreprises", d: "Des ERP et SI structurés : un atout, mais aussi le défi d'adapter les flux, gérer la multiplicité des outils, l'interopérabilité et la conduite du changement à grande échelle." },
  { t: "ETI", d: "Un entre-deux exposé : systèmes hétérogènes, effort souvent sous-estimé. Bien anticipée, la réforme devient un levier pour fiabiliser la donnée et gagner en compétitivité." },
  { t: "TPE / PME", d: "Le plus grand saut (encore beaucoup de papier et de PDF), mais l'opportunité la plus forte : moins de ressaisies, délais de paiement réduits, traçabilité complète." },
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
    q: "Y aura-t-il une tolérance au démarrage ?",
    a: "Oui. Le 10 juillet 2026, le ministre a confirmé le calendrier tout en annonçant une « doctrine de démarrage » tolérante et bienveillante pour les entreprises de bonne foi : pas de sanctions automatiques pour celles qui documentent leurs difficultés et se corrigent, au moins jusqu'à fin 2026. Attention : ce n'est pas une « période blanche » — l'obligation reste, il faut être prêt et documenté.",
  },
  {
    q: "Combien de temps faut-il pour se préparer ?",
    a: "Une préparation efficace demande généralement 10 à 18 mois selon la taille et la complexité de l'organisation. C'est pourquoi il faut anticiper dès maintenant : agir pour ne pas subir. Un projet lancé doit être un projet piloté.",
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

      <header className="mkt-phead mkt-ai-head">
        <div className="mkt-phead-in mkt-ai-hero">
          <div className="mkt-ai-hero-txt">
            <span className="eyebrow">Facturation électronique</span>
            <h1>Votre <em>chef d&apos;orchestre</em> de la réforme</h1>
            <p>
              Entre plateformes, formats, échéances et outils, la facturation
              électronique est un projet à part entière. D&apos;abord française, puis
              européenne, nous coordonnons tous les acteurs et vous guidons — en
              toute indépendance — pour en faire un véritable levier de transformation.
            </p>
            <div className="mkt-ai-hero-cta" style={{ marginTop: "1.8rem" }}>
              <a className="btn btn-gold" href="https://forms.cloud.microsoft/e/mr63uL9LsU" target="_blank" rel="noopener noreferrer">Recevoir le Guide RFE</a>
              <Link className="btn btn-ghost" href="/rendez-vous">Faire le point</Link>
            </div>
          </div>
          <RfeMascot />
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

      {/* Au-delà de la conformité */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Une opportunité, pas seulement une contrainte</span>
            <h2>Au-delà de la conformité, <em>les opportunités de demain</em></h2>
            <p>
              La réforme structure la donnée et automatise la production comptable.
              Bien menée, elle libère du temps pour ce qui compte vraiment : le
              pilotage et le conseil.
            </p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.12rem" }}>Une donnée structurée</h3>
              <p>Fini les flux hétérogènes (papier, mails, PDF) : un tunnel d&apos;entrée homogène, sans erreur de ressaisie.</p>
            </div>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.12rem" }}>Une production automatisée</h3>
              <p>Comptabilité automatisée dans sa majeure partie et, à terme, pré-remplissage des déclarations de TVA.</p>
            </div>
            <div className="mkt-svc">
              <h3 style={{ fontSize: "1.12rem" }}>Plus de temps pour le conseil</h3>
              <p>La valeur se déplace vers le pilotage, l&apos;analyse et l&apos;accompagnement du dirigeant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendrier */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le calendrier</span>
            <h2>Une entrée en vigueur <em>progressive</em></h2>
            <p>L&apos;adoption s&apos;échelonne de 2026 à 2027, selon la taille des entreprises. Une préparation efficace demande 10 à 18 mois : <strong>anticiper, c&apos;est agir pour ne pas subir</strong>.</p>
          </div>
          <div className="mkt-timeline">
            {CAL.map((c) => (
              <div className={`mkt-tl-item${c.on ? " on" : ""}`} key={c.d}>
                <div className="mkt-tl-date">{c.d}</div>
                <div className="mkt-tl-title">{c.t}</div>
                <div className="mkt-tl-sub">{c.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avancement de la réforme — au cœur du réacteur */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Où en est la réforme ?</span>
            <h2>Une réforme qui <em>avance</em> — et que nous suivons en temps réel</h2>
            <p>
              Membre de la <strong>communauté des relais de la DGFiP</strong> et engagé dans les
              travaux de normalisation AFNOR, Trevys est au cœur du réacteur : nous relayons les
              dernières décisions et portons la voix des entreprises.
            </p>
          </div>
          <div className="mkt-vtl">
            {ADVANCE.map((a) => (
              <div className={`mkt-vtl-item${a.done ? " done" : ""}${a.hot ? " hot" : ""}${a.milestone ? " milestone" : ""}`} key={a.d}>
                <div className="mkt-vtl-node" />
                <div className="mkt-vtl-body">
                  <div className="mkt-vtl-date">{a.d}{a.hot && <span className="mkt-vtl-tag">Dernière annonce</span>}</div>
                  <div className="mkt-vtl-title">{a.t}</div>
                  <div className="mkt-vtl-sub">{a.s}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mkt-stats-row">
            <div className="mkt-stat-chip"><b>138</b><span>plateformes agréées immatriculées</span></div>
            <div className="mkt-stat-chip"><b>2 M</b><span>entreprises déjà dans l&apos;annuaire</span></div>
            <div className="mkt-stat-chip"><b>95</b><span>contrats Peppol signés</span></div>
            <div className="mkt-stat-chip"><b>76 %</b><span>de dirigeants confiants pour l&apos;échéance</span></div>
          </div>
          <p className="muted" style={{ fontSize: ".78rem", color: "var(--ink3)", marginTop: "1rem" }}>
            Sources : DGFiP / AIFE — Communauté des relais, 10 juillet 2026. Baromètre facturation électronique (IPSOS).
          </p>
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
            <span className="eyebrow">Les 4 flux de l&apos;écosystème</span>
            <h2>Ce qui <em>circule</em> réellement</h2>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
            {FLUX.map((f) => (
              <div className="mkt-svc" key={f.t}>
                <h3 style={{ fontSize: "1.1rem" }}>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>

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

      {/* Notre positionnement — chef d'orchestre */}
      <section className="sec">
        <div className="wrap">
          <div className="mkt-orch">
            <div className="mkt-orch-txt">
              <span className="eyebrow">Notre positionnement</span>
              <h2>Un <em>chef d&apos;orchestre</em>, pas un vendeur de logiciel</h2>
              <p>
                Éditeurs, plateformes agréées, DSI, équipes comptables, dirigeants :
                une mise en conformité réussie fait intervenir de nombreux acteurs.
                Notre rôle est de les <strong>coordonner</strong> et d&apos;être le
                garant d&apos;une évolution maîtrisée.
              </p>
              <p>
                Nous ne vendons aucune plateforme : nous vous aidons à choisir la
                bonne, à l&apos;intégrer à votre système d&apos;information et à
                embarquer vos équipes — gouvernance claire (COPIL, comité projet,
                équipe), rôles définis (matrice RACI) et jalons maîtrisés.
              </p>
            </div>
            <ul className="mkt-orch-list">
              <li><b>Indépendance</b><span>Aucun lien commercial avec un éditeur : nos recommandations sont objectives.</span></li>
              <li><b>Vision d&apos;ensemble</b><span>Flux, outils, équipes, échéances : nous tenons tous les fils du projet.</span></li>
              <li><b>Garant de la conformité</b><span>Expert-comptable, garant de la conformité fiscale et documentaire de bout en bout.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Notre méthode en 5 phases */}
      <section className="sec band">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Notre méthode</span>
            <h2>Une démarche projet en <em>5 phases</em></h2>
            <p>Une méthodologie éprouvée, rythmée par des jalons clairs et des livrables concrets à chaque étape.</p>
          </div>
          <div className="mkt-svc-grid">
            {METHOD.map((s) => (
              <div className="mkt-svc" key={s.n}>
                <span className="num">{s.n}</span>
                <span className="mkt-svc-dur">{s.dur}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selon la taille */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Un accompagnement sur mesure</span>
            <h2>Adapté à <em>votre organisation</em></h2>
            <p>Grande entreprise, ETI ou TPE/PME : les enjeux diffèrent, notre méthode s&apos;ajuste à votre réalité.</p>
          </div>
          <div className="mkt-svc-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            {TAILLE.map((t) => (
              <div className="mkt-svc" key={t.t}>
                <h3 style={{ fontSize: "1.15rem" }}>{t.t}</h3>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crédibilité fondateur */}
      <section className="sec band">
        <div className="wrap">
          <div className="mkt-founder">
            <div className="mkt-founder-media">
              <TeamPhoto
                src={getPeoplePhoto("john-levy") ?? "/uploads/john-levy.jpg"}
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
                <li><span className="k">Formations RFE</span> Concepteur d&apos;un parcours de formation à la conduite de projet facturation électronique</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
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
