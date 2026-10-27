// Retours d'expérience / cas de missions, présentés sur des sous-pages non
// référencées dans le menu — accessibles via un bouton depuis la page
// d'expertise ou de facturation électronique correspondante.

export type CaseMission = {
  client: string; // nom du client (ou groupe), tel qu'affiché
  context?: string; // précision optionnelle (ex. « filiale de… »)
  text: string[];
};

export type CaseStudy = {
  slug: string; // correspond au slug de l'expertise, ou "facturation-electronique"
  eyebrow: string;
  h1: string;
  chapeau: string;
  missions: CaseMission[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "si-finance",
    eyebrow: "Retour d'expérience",
    h1: "Choisir et déployer un nouvel ERP Finance : l'exemple Jaji",
    chapeau: "Du cadrage du besoin jusqu'à l'aide à la contractualisation, aux côtés de la direction générale.",
    missions: [
      {
        client: "Jaji",
        context: "filiale de Klesia",
        text: [
          "Jaji, filiale du groupe de protection sociale Klesia, avait besoin de faire évoluer son système d'information Finance pour accompagner sa croissance. Nous sommes intervenus aux côtés de la direction générale sur l'ensemble du choix du nouvel ERP finance, Oracle NetSuite.",
          "Notre rôle a commencé par le cadrage du besoin : comprendre les flux comptables réels, les contraintes de clôture, les irritants de l'outil en place, et ce que la direction générale attendait réellement d'un nouvel outil — bien au-delà d'une liste de fonctionnalités cochées sur une fiche éditeur.",
          "Nous avons ensuite accompagné la sélection de la solution, confronté les offres du marché aux besoins réellement exprimés, et mené les échanges jusqu'à l'aide à la contractualisation avec l'éditeur retenu — en veillant à ce que les engagements pris à l'oral se retrouvent noir sur blanc dans le contrat.",
          "Cette mission illustre ce qui distingue notre accompagnement sur les projets de système d'information Finance : une équipe qui comprend aussi bien le dossier comptable que l'architecture applicative, présente du premier atelier de cadrage jusqu'à la signature.",
        ],
      },
    ],
  },
  {
    slug: "erp-amoa",
    eyebrow: "Retour d'expérience",
    h1: "AMOA sur des programmes ERP structurants",
    chapeau: "Pilotage de programmes de refonte ou d'évolution des outils finance, pour des groupes bancaires et de grandes entreprises.",
    missions: [
      {
        client: "Pierre & Vacances",
        text: [
          "Nous sommes intervenus en assistance à maîtrise d'ouvrage sur un programme de refonte des outils finance de Pierre & Vacances, autour de SAP. Notre rôle : piloter le programme aux côtés des équipes finance, arbitrer les choix fonctionnels en connaissance de cause, et garantir la cohérence entre le besoin métier initial et ce qui sortait effectivement du projet.",
          "Cet accompagnement a notamment couvert le pilotage des phases de recette, essentielles pour s'assurer que les processus financiers cibles fonctionnent réellement comme prévu avant la bascule en production.",
        ],
      },
      {
        client: "Ma French Bank",
        context: "filiale de La Banque Postale",
        text: [
          "Pour Ma French Bank, filiale digitale de La Banque Postale, nous avons mené une mission d'AMOA sur l'évolution des outils finance internes. Notre équipe a assuré le pilotage du programme, en lien constant entre les équipes finance et les équipes techniques, jusqu'à la recette des évolutions livrées.",
          "Sur ce type de programme, notre valeur ajoutée tient à la double compétence de nos consultants : capables de discuter traitement comptable avec la direction financière, puis spécification technique avec les équipes IT, dans la même réunion.",
        ],
      },
    ],
  },
  {
    slug: "transformation-digitale",
    eyebrow: "Retour d'expérience",
    h1: "Digitaliser et automatiser les processus comptables et financiers",
    chapeau: "De la remontée comptable automatisée aux tableaux de bord de pilotage, pour des cabinets comme pour des directions financières.",
    missions: [
      {
        client: "Cabinets d'expertise comptable",
        text: [
          "Nous avons accompagné plusieurs cabinets d'expertise comptable dans la digitalisation de leur processus de production comptable, avec un objectif précis : automatiser la remontée comptable, pour réduire les ressaisies et fiabiliser les données transmises aux clients comme aux équipes de révision.",
        ],
      },
      {
        client: "Directions financières",
        text: [
          "Côté directions financières, nous intervenons régulièrement sur l'automatisation des tableaux de bord de contrôle de gestion, en nous appuyant sur des outils comme Power BI pour construire des dashboards pilotables en temps réel, ainsi que sur des outils de workflow (comme Dust) pour automatiser les tâches répétitives qui ralentissent les clôtures.",
          "Dans chaque mission, nous commençons par comprendre le geste métier existant avant de le transformer : un tableau de bord brillant mais déconnecté des usages réels des équipes ne produit jamais la valeur attendue.",
        ],
      },
    ],
  },
  {
    slug: "facturation-electronique",
    eyebrow: "Retour d'expérience",
    h1: "Piloter des programmes de facturation électronique à grande échelle",
    chapeau: "Des programmes menés pour des banques et de grandes entreprises, dont des acteurs du data center.",
    missions: [
      {
        client: "Groupes bancaires",
        text: [
          "Nous avons dirigé des programmes de mise en conformité à la réforme de la facturation électronique pour des établissements bancaires, où la volumétrie des flux et la diversité des systèmes en place imposent un pilotage rigoureux : cartographie des flux, choix de la Plateforme de Dématérialisation Partenaire, coordination des équipes IT et finance, et sécurisation du calendrier de bascule.",
        ],
      },
      {
        client: "Entreprises du secteur data center",
        text: [
          "Pour des entreprises du secteur du data center, dont les flux de facturation combinent une forte volumétrie et des spécificités contractuelles complexes, nous avons piloté le cadrage et le déploiement de la réforme, en sécurisant notamment la piste d'audit fiable sur l'ensemble des flux concernés.",
        ],
      },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
